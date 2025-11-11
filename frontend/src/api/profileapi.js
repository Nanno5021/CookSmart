import { apiFetch } from "./apiClient";

// GET: Fetch the current logged-in user's profile
export async function fetchMyProfile() {
  return await apiFetch("/profile/me"); // Changed from /profiles/me to /profile/me
}

// GET: Fetch a profile by username (public)
export async function fetchProfileByUsername(username) {
  return await apiFetch(`/profile/${encodeURIComponent(username)}`);
}

// PUT: Update current user's profile
export async function updateMyProfile(profileData) {
  return await apiFetch("/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
}

// POST: Upload avatar
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token");
  
  const response = await fetch("http://localhost:5037/api/profile/avatar", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData, // Don't set Content-Type for FormData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Upload failed");
  }

  return await response.json();
}
