const BASE = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://steel-management-xade.vercel.app/api"
    : "http://localhost:5000/api")
).replace(/\/+$/, "");

async function request(path, options = {}) {
  const token = localStorage.getItem("steel_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || "Request failed");
  }

  // Handle empty or text responses cleanly
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const api = {
  // Existing CRUD & Analytics methods
  list: (ep) => request(`/${ep}`),
  create: (ep, body) =>
    request(`/${ep}`, { method: "POST", body: JSON.stringify(body) }),
  update: (ep, id, body) =>
    request(`/${ep}/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (ep, id) =>
    request(`/${ep}/${id}`, { method: "DELETE" }),
  analytics: () => request("/analytics"),

  // Authentication methods
  login: (credentials) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (userData) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(userData) }),
  getMe: () => request("/auth/me"),
};

export default api;
