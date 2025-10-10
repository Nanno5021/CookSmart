const API_BASE = "http://localhost:5037/api";

//Token
export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
}

//Header
export function getAuthHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

//apiFetch
export async function apiFetch(endpoint, options = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

// Auto-logout on 401 Unauthorized
  if (response.status === 401) {
    removeToken();
    window.location.href = "/login";
    throw new Error("Unauthorized - Please log in again");
  }

  // Pass error messages from server
  try {
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "API Error");
    return data;
  } catch {
    const text = await response.text();
    if (!response.ok) throw new Error(text || "API Error");
    return text;
  }
}
