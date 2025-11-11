import { apiFetch } from "./apiClient";

// GET: Fetch all users
export async function fetchAllUsers() {
  return await apiFetch("/ManageUser");
}

// POST: Ban a user
export async function banUser(id) {
  return await apiFetch(`/ManageUser/ban/${id}`, {
    method: "POST",
  });
}

// POST: Update role for a user
export async function updateUserRole(id, newRole) {
  return await apiFetch(`/ManageUser/update-role/${id}`, {
    method: "POST",
    body: JSON.stringify(newRole),
  });
}
