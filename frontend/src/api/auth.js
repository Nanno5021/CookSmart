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
      // Store individual user data fields
      setUserData({
        userId: data.user.id,
        username: data.user.username,
        email: data.user.email,
        fullName: data.user.fullName,
        phone: data.user.phone,
        role: data.user.role
      });
      
      // IMPORTANT: Also store the complete user object for ProfilePage and EditProfilePage
      const userObj = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        fullName: data.user.fullName,
        phone: data.user.phone,
        role: data.user.role,
        profilePic: data.user.avatarUrl || null
      };
      localStorage.setItem("user", JSON.stringify(userObj));
      
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