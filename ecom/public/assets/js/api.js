const API_BASE = "";

export function getToken() {
  return localStorage.getItem("token") || "";
}

export function setToken(token) {
  if (!token) localStorage.removeItem("token");
  else localStorage.setItem("token", token);
}

export async function apiFetch(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || `Invalid JSON (${res.status})`);
  }

  if (!res.ok) {
    const message = json?.error?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.details = json?.error?.details;
    throw err;
  }

  return json;
}
