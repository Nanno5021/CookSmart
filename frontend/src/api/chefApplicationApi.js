import { apiFetch } from "./apiClient";

// POST: Create a new chef application
export async function createChefApplication(applicationData, userId) {
  return await apiFetch(`/ChefApplicationController2?userId=${userId}`, {
    method: "POST",
    body: JSON.stringify(applicationData),
  });
}
// GET: Fetch a single chef application by ID
export async function fetchChefApplicationById(id) {
  return await apiFetch(`/ChefApplicationController2/${id}`);
}

// GET: Fetch all chef applications by user ID
export async function fetchChefApplicationsByUser(userId) {
  return await apiFetch(`/ChefApplicationController2/user/${userId}`);
}

// GET: Fetch all chef applications (admin)
export async function fetchAllChefApplications(status = null) {
  const statusParam = status ? `?status=${status}` : "";
  return await apiFetch(`/ChefApplicationController2/${statusParam}`);
}

// PUT: Review a chef application (admin)
export async function reviewChefApplication(id, reviewData) {
  return await apiFetch(`/ChefApplicationController2/${id}/review`, {
    method: "PUT",
    body: JSON.stringify(reviewData),
  });
}

// DELETE: Delete a chef application
export async function deleteChefApplication(id, userId) {
  return await apiFetch(`/ChefApplicationController2/${id}?userId=${userId}`, {
    method: "DELETE",
  });
}