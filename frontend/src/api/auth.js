import { apiFetch, setToken, clearAllAuthData, setUserData } from "./apiClient";

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

    console.log("Full backend response:", data);
  console.log("User object:", data.user);
  console.log("Role from user:", data.user?.role);

  if (data.token) {
    setToken(data.token);

    if (data.user) {
      setUserData({
        userId: data.user.id,
        username: data.user.username,
        email: data.user.email,
        fullName: data.user.fullName,
        phone: data.user.phone,
        role: data.user.role
      });
      
      console.log("Login successful:", {
        token: data.token,
        userId: data.user.id,
        username: data.user.username,
        email: data.user.email
      });
    }
  } else {
    console.warn("No token received");
  }

  return data;
}

export function logoutUser() {
  clearAllAuthData();
  
  window.location.href = "/login";
}