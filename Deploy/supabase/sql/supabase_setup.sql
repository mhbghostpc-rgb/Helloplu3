-- Supabase setup for access-code + device binding system
-- Run this in the Supabase SQL Editor

-- Required extensions
create extension if not exists pgcrypto with schema extensions;

-- Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  access_code text unique not null,
  full_name text,
  phone text,
  access_level text not null default 'user',
  bound_device_key_hash text,
  bound_at timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists access_level text not null default 'user';

comment on table public.profiles is 'Per-user profile with unique access code and device binding info.';
comment on column public.profiles.access_code is 'Unique access code assigned to a student.';
comment on column public.profiles.full_name is 'User full name.';
comment on column public.profiles.phone is 'User phone number.';
comment on column public.profiles.access_level is 'Access level: user or admin.';
comment on column public.profiles.bound_device_key_hash is 'SHA-256 hash of the bound device key.';
comment on column public.profiles.bound_at is 'Timestamp when the access code was first bound to a device.';
comment on column public.profiles.status is 'Account status flag.';

create table if not exists public.protected_content (
  id bigint generated always as identity primary key,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

comment on table public.protected_content is 'Content visible only after successful access-code and device verification.';

create table if not exists public.access_logs (
  id bigint generated always as identity primary key,
  user_id uuid,
  access_code text,
  device_key_hash text,
  success boolean not null,
  reason text not null,
  created_at timestamptz not null default now()
);

comment on table public.access_logs is 'Audit log for access attempts (successful and failed).';

-- Indexes
create index if not exists access_logs_user_id_idx on public.access_logs (user_id);
create index if not exists access_logs_created_at_idx on public.access_logs (created_at);
create index if not exists profiles_access_code_idx on public.profiles (access_code);
create index if not exists profiles_access_level_idx on public.profiles (access_level);

-- Trigger for updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is 'Updates updated_at on row changes.';

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Access code generation
create or replace function public.generate_access_code()
returns text
language plpgsql
as $$
declare
  v_code text;
  v_exists boolean;
begin
  loop
    -- 16 hex chars, easy to paste and unique enough for small cohorts
    v_code := encode(extensions.gen_random_bytes(8), 'hex');
    select exists(select 1 from public.profiles where access_code = v_code) into v_exists;
    if not v_exists then
      return v_code;
    end if;
  end loop;
end;
$$;

comment on function public.generate_access_code() is 'Generates a unique access code for a new profile.';

-- Profile creation on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (id, email, access_code, access_level)
  values (new.id, new.email, public.generate_access_code(), 'user');
  return new;
end;
$$;

comment on function public.handle_new_user() is 'Creates a profile row when a new auth user is created.';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Access helpers
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_level text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return false;
  end if;

  select access_level into v_level
  from public.profiles
  where id = v_user_id;

  return v_level = 'admin';
end;
$$;

comment on function public.is_admin() is 'Checks whether the current user has admin access.';

create or replace function public.get_my_profile()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_profile public.profiles%rowtype;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return null;
  end if;

  select * into v_profile
  from public.profiles
  where id = v_user_id;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'id', v_profile.id,
    'email', v_profile.email,
    'full_name', v_profile.full_name,
    'phone', v_profile.phone,
    'access_level', v_profile.access_level,
    'access_code', v_profile.access_code
  );
end;
$$;

comment on function public.get_my_profile() is 'Returns profile details for the current user.';

create or replace function public.admin_upsert_profile_by_email(
  p_email text,
  p_full_name text,
  p_phone text,
  p_access_level text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_allowed boolean;
  v_profile_id uuid;
begin
  v_allowed := public.is_admin();
  if v_allowed is not true then
    raise exception 'admin_only';
  end if;

  if p_access_level not in ('user', 'admin') then
    raise exception 'invalid_access_level';
  end if;

  select id into v_profile_id
  from public.profiles
  where email = p_email;

  if v_profile_id is null then
    return jsonb_build_object('updated', false);
  end if;

  update public.profiles
  set full_name = p_full_name,
      phone = p_phone,
      access_level = p_access_level,
      updated_at = now()
  where id = v_profile_id;

  return jsonb_build_object('updated', true, 'id', v_profile_id);
end;
$$;

comment on function public.admin_upsert_profile_by_email(text, text, text, text)
is 'Admin-only: updates profile details by email.';

-- RPC: activate_access_code
create or replace function public.activate_access_code(p_code text, p_device_key text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_device_hash text;
  v_profile public.profiles%rowtype;
  v_allowed boolean := false;
  v_reason text := 'unknown';
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('allowed', false, 'reason', 'not_authenticated');
  end if;

  if p_code is null or length(trim(p_code)) = 0 then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_code');
  end if;

  if p_device_key is null or length(trim(p_device_key)) = 0 then
    return jsonb_build_object('allowed', false, 'reason', 'invalid_device_key');
  end if;

  v_device_hash := encode(extensions.digest(p_device_key, 'sha256'), 'hex');

  select * into v_profile
  from public.profiles
  where id = v_user_id and access_code = p_code;

  if not found then
    v_allowed := false;
    v_reason := 'invalid_code';
    insert into public.access_logs (user_id, access_code, device_key_hash, success, reason)
    values (v_user_id, p_code, v_device_hash, v_allowed, v_reason);
    return jsonb_build_object('allowed', v_allowed, 'reason', v_reason);
  end if;

  if v_profile.bound_device_key_hash is null then
    update public.profiles
    set bound_device_key_hash = v_device_hash,
        bound_at = now()
    where id = v_user_id;

    v_allowed := true;
    v_reason := 'device_bound';
  elsif v_profile.bound_device_key_hash = v_device_hash then
    v_allowed := true;
    v_reason := 'device_already_verified';
  else
    v_allowed := false;
    v_reason := 'device_mismatch';
  end if;

  insert into public.access_logs (user_id, access_code, device_key_hash, success, reason)
  values (v_user_id, p_code, v_device_hash, v_allowed, v_reason);

  return jsonb_build_object('allowed', v_allowed, 'reason', v_reason);
end;
$$;

comment on function public.activate_access_code(text, text) is 'Binds or verifies a device key for the given access code.';

-- RPC: check_content_access
create or replace function public.check_content_access(p_code text, p_device_key text)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_device_hash text;
  v_profile public.profiles%rowtype;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return false;
  end if;

  if p_code is null or p_device_key is null then
    return false;
  end if;

  v_device_hash := encode(extensions.digest(p_device_key, 'sha256'), 'hex');

  select * into v_profile
  from public.profiles
  where id = v_user_id and access_code = p_code;

  if not found then
    return false;
  end if;

  if v_profile.bound_device_key_hash is null then
    return false;
  end if;

  return v_profile.bound_device_key_hash = v_device_hash;
end;
$$;

comment on function public.check_content_access(text, text) is 'Checks whether the user, access code, and device key match.';

-- RPC: get_protected_content
create or replace function public.get_protected_content(p_code text, p_device_key text)
returns setof public.protected_content
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if public.check_content_access(p_code, p_device_key) then
    return query select * from public.protected_content order by id asc;
  end if;

  raise exception 'access_denied';
end;
$$;

comment on function public.get_protected_content(text, text) is 'Returns protected content only for verified users.';

-- RLS
alter table public.profiles enable row level security;
alter table public.protected_content enable row level security;
alter table public.access_logs enable row level security;

-- Default deny policies (explicit for clarity)
drop policy if exists profiles_deny_all on public.profiles;
drop policy if exists protected_content_deny_all on public.protected_content;
drop policy if exists access_logs_deny_all on public.access_logs;
create policy profiles_deny_all on public.profiles for all using (false) with check (false);
create policy protected_content_deny_all on public.protected_content for all using (false) with check (false);
create policy access_logs_deny_all on public.access_logs for all using (false) with check (false);

-- Grants and revokes
revoke all on public.profiles from anon, authenticated;
revoke all on public.protected_content from anon, authenticated;
revoke all on public.access_logs from anon, authenticated;

grant execute on function public.activate_access_code(text, text) to authenticated;
grant execute on function public.check_content_access(text, text) to authenticated;
grant execute on function public.get_protected_content(text, text) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_my_profile() to authenticated;
grant execute on function public.admin_upsert_profile_by_email(text, text, text, text) to authenticated;

-- Sample protected content
insert into public.protected_content (title, body)
values ('Welcome', 'You have successfully passed access-code and device verification.')
on conflict do nothing;
