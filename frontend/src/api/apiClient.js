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

  // Handle response
  const contentType = response.headers.get("content-type");
  let data;
  
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (response.status === 401) {
    const isAuthEndpoint = endpoint.includes("/auth/login") || endpoint.includes("/auth/register");
    
    if (!isAuthEndpoint) {
      removeToken();
      const error = new Error("Unauthorized - Please log in");
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
      throw error;
    }
  }

  if (!response.ok) {
    throw new Error(data.message || data || "API Error");
  }
  
  return data;
}