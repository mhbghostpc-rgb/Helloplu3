/* global window */

const SUPABASE_URL = "https://ucbhroawhuyudqkfwxbg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjYmhyb2F3aHV5dWRxa2Z3eGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODM4NDEsImV4cCI6MjA5NTU1OTg0MX0.XjhFIGcjuRgLLRULMS9kuGfzyTOJMe7j_z7z9cilOu0";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
);

const STORAGE_KEYS = {
  deviceKey: "device_key",
  accessCode: "access_code",
};

function getDeviceKey() {
  let deviceKey = window.localStorage.getItem(STORAGE_KEYS.deviceKey);
  if (!deviceKey) {
    deviceKey = window.crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEYS.deviceKey, deviceKey);
  }
  return deviceKey;
}

function setAccessCode(code) {
  window.localStorage.setItem(STORAGE_KEYS.accessCode, code);
}

function getAccessCode() {
  return window.localStorage.getItem(STORAGE_KEYS.accessCode);
}

function clearAccessCode() {
  window.localStorage.removeItem(STORAGE_KEYS.accessCode);
}

async function signUp(email, password) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

async function signIn(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

async function signOut() {
  clearAccessCode();
  const { error } = await supabaseClient.auth.signOut();
  return { error };
}

async function activateAccessCode(code) {
  const deviceKey = getDeviceKey();
  const { data, error } = await supabaseClient.rpc("activate_access_code", {
    p_code: code,
    p_device_key: deviceKey,
  });
  return { data, error };
}

async function checkContentAccess(code) {
  const deviceKey = getDeviceKey();
  const { data, error } = await supabaseClient.rpc("check_content_access", {
    p_code: code,
    p_device_key: deviceKey,
  });
  return { data, error };
}

async function getProtectedContent(code) {
  const deviceKey = getDeviceKey();
  const { data, error } = await supabaseClient.rpc("get_protected_content", {
    p_code: code,
    p_device_key: deviceKey,
  });
  return { data, error };
}

async function getMyProfile() {
  const { data, error } = await supabaseClient.rpc("get_my_profile");
  return { data, error };
}

async function isAdmin() {
  const { data, error } = await supabaseClient.rpc("is_admin");
  return { data, error };
}

async function adminUpsertProfileByEmail(payload) {
  const { data, error } = await supabaseClient.rpc(
    "admin_upsert_profile_by_email",
    payload,
  );
  return { data, error };
}

async function adminCreateUser(payload) {
  const { data, error } = await supabaseClient.functions.invoke(
    "admin-create-user",
    { body: payload },
  );
  return { data, error };
}

async function requireSession() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  return session;
}

async function guardMainPage(onAllowed) {
  const session = await requireSession();
  if (!session) {
    window.location.replace("login.html");
    return;
  }

  const code = getAccessCode();
  if (!code) {
    window.location.replace("login.html");
    return;
  }

  const { data, error } = await checkContentAccess(code);
  if (error || data !== true) {
    window.location.replace("login.html");
    return;
  }

  if (typeof onAllowed === "function") {
    onAllowed();
  }
}

async function guardAdminPage(onAllowed) {
  const session = await requireSession();
  if (!session) {
    window.location.replace("login.html");
    return;
  }

  const code = getAccessCode();
  if (!code) {
    window.location.replace("login.html");
    return;
  }

  const { data: allowed, error: accessError } = await checkContentAccess(code);
  if (accessError || allowed !== true) {
    window.location.replace("login.html");
    return;
  }

  const { data: adminAllowed, error: adminError } = await isAdmin();
  if (adminError || adminAllowed !== true) {
    window.location.replace("choice.html");
    return;
  }

  if (typeof onAllowed === "function") {
    onAllowed();
  }
}

async function checkAccess(options = {}) {
  const requireAdmin = options.requireAdmin === true;
  const requireCode = options.requireCode !== false;

  const session = await requireSession();
  if (!session) {
    return { allowed: false, reason: "no_session" };
  }

  if (requireCode) {
    const code = getAccessCode();
    if (!code) {
      return { allowed: false, reason: "no_code" };
    }

    const { data: allowed, error } = await checkContentAccess(code);
    if (error || allowed !== true) {
      return { allowed: false, reason: "no_access" };
    }
  }

  if (requireAdmin) {
    const { data: isAdminAllowed, error } = await isAdmin();
    if (error || isAdminAllowed !== true) {
      return { allowed: false, reason: "not_admin" };
    }
  }

  return { allowed: true };
}

window.Auth = {
  signUp,
  signIn,
  signOut,
  activateAccessCode,
  checkContentAccess,
  getProtectedContent,
  getMyProfile,
  isAdmin,
  adminUpsertProfileByEmail,
  adminCreateUser,
  getDeviceKey,
  setAccessCode,
  getAccessCode,
  guardMainPage,
  guardAdminPage,
  checkAccess,
};
