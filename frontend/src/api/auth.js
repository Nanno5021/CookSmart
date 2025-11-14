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



  if (data.token) {
    setToken(data.token);

    if (data.user) {
      setUserData({
        userId: data.user.id,
        username: data.user.username,
        email: data.user.email,
        fullName: data.user.fullName,
        phone: data.user.phone,
        role: data.user.role,
        chefId: data.user.chefId 
      });
      
      // IMPORTANT: Also store the complete user object for ProfilePage and EditProfilePage
      const userObj = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        fullName: data.user.fullName,
        phone: data.user.phone,
        role: data.user.role,
        profilePic: data.user.avatarUrl || null,
        chefId: data.user.chefId || null 
      };
      localStorage.setItem("user", JSON.stringify(userObj));
      
      console.log("Login successful:", {
        token: data.token,
        userId: data.user.id,
        username: data.user.username,
        email: data.user.email,
        chefId: data.user.chefId
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

export async function requestPasswordReset(email) {
  return await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email, otp) {
  return await apiFetch("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export async function resetPassword(email, otp, newPassword) {
  return await apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, otp, newPassword }),
  });
}