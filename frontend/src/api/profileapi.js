import { apiFetch } from "./apiClient";

// GET: Fetch all profiles
export async function fetchAllProfiles() {
  return await apiFetch("/profiles");
}

// GET: Fetch a single profile by ID or username
export async function fetchProfileById(idOrUsername) {
  return await apiFetch(`/profiles/${encodeURIComponent(idOrUsername)}`);
}

// GET: Fetch the current logged-in user's profile
export async function fetchMyProfile() {
  return await apiFetch("/profiles/me");
}

// POST: Create a new profile
export async function createProfile(profileData) {
  return await apiFetch("/profiles", {
    method: "POST",
    body: JSON.stringify(profileData),
  });
}

// PUT: Update an existing profile
export async function updateProfile(id, profileData) {
  return await apiFetch(`/profiles/${id}`, {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
}

// DELETE: Delete a profile
export async function deleteProfile(id) {
  return await apiFetch(`/profiles/${id}`, {
    method: "DELETE",
  });
}
