import { apiFetch } from "./apiClient";

export async function fetchProfile(usernameOrId = "me") {
  const endpoint = usernameOrId === "me"
    ? "/profile/me"
    : `/profile/${encodeURIComponent(usernameOrId)}`;
  
  return await apiFetch(endpoint, { method: "GET" });
}

export async function updateProfile(profileData) {
  return await apiFetch("/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
}