const API_BASE = "http://localhost:5037/api";

// Token management
export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
}

// NEW: User data management
export function setUserData(data) {
  if (data.role) {
    localStorage.setItem("role", data.role); 
  }
  if (data.userId) {
    localStorage.setItem("userId", data.userId);
  }
  if (data.fullName) {
    localStorage.setItem("fullName", data.fullName);
  }
}

export function clearAllAuthData() {
  const authKeys = [
    "token",
    "role",
    "userId",
    "fullName",
    "auth_token",
    "refresh_token",
    "admin_auth_token",
    "admin_refresh_token",
    "admin_id",
    "admin_user_id",
    "id",
    "user_id",
    "verified",
    "merchantId",
    "category",
    "branch_id",
    "branch_name",
    "deliveryMethod",
    "sellHereflg",
    "redux_localstorage_simple"
  ];
  
  authKeys.forEach(key => localStorage.removeItem(key));
}

// Header
export function getAuthHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// apiFetch
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
      clearAllAuthData(); 
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