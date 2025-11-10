
import { apiFetch, setToken, removeToken } from "./apiClient";

export async function registerUser(formData) {
  return await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export async function loginUser(formData) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(formData),
  });

  if (data.token) {
    setToken(data.token);
    console.log("Token saved:", data.token);
  } else {
    console.warn("No token received");
  }

  return data;
}

export function logoutUser() {
  removeToken();
  window.location.href = "/login";
}
