const BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  // DELETE returns { message } with no body issues
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const api = {
  list: (ep) => request(`/${ep}`),
  create: (ep, body) =>
    request(`/${ep}`, { method: "POST", body: JSON.stringify(body) }),
  update: (ep, id, body) =>
    request(`/${ep}/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (ep, id) =>
    request(`/${ep}/${id}`, { method: "DELETE" }),
  analytics: () => request("/analytics"),
};

export default api;
