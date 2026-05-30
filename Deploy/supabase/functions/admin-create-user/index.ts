import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("PROJECT_URL");
const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "missing_env" }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    return jsonResponse({ error: "missing_auth" }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userError } = await adminClient.auth.getUser(
    token,
  );

  if (userError || !userData?.user) {
    return jsonResponse({ error: "invalid_auth" }, 401);
  }

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("access_level")
    .eq("id", userData.user.id)
    .single();

  if (profileError || profile?.access_level !== "admin") {
    return jsonResponse({ error: "admin_only" }, 403);
  }

  const payload = await req.json().catch(() => null);
  if (!payload) {
    return jsonResponse({ error: "invalid_payload" }, 400);
  }

  const email = String(payload.email || "").trim();
  const password = String(payload.password || "").trim();
  const fullName = String(payload.full_name || "").trim();
  const phone = String(payload.phone || "").trim();
  const accessLevel = String(payload.access_level || "user").trim();

  if (!email || !password || !fullName || !phone) {
    return jsonResponse({ error: "missing_fields" }, 400);
  }

  if (accessLevel !== "user" && accessLevel !== "admin") {
    return jsonResponse({ error: "invalid_access_level" }, 400);
  }

  const { data: created, error: createError } = await adminClient.auth.admin
    .createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone },
    });

  if (createError || !created?.user) {
    const message = createError?.message || "create_failed";
    const status = message.includes("already registered") ? 409 : 400;
    return jsonResponse({ error: message }, status);
  }

  const userId = created.user.id;

  const updateResult = await adminClient
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      access_level: accessLevel,
    })
    .eq("id", userId);

  if (updateResult.error) {
    return jsonResponse({ error: "profile_update_failed" }, 500);
  }

  return jsonResponse({ ok: true, user_id: userId });
});
