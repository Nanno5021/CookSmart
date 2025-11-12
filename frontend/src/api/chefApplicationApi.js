import { apiFetch, getToken } from "./apiClient";

const API_BASE_URL = "http://localhost:5037/api";

// POST: Upload certification image
export async function uploadCertificationImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/ChefApplication/upload-certification`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to upload certification image" }));
    throw new Error(error.message || "Failed to upload certification image");
  }

  return await response.json();
}

// POST: Create a new chef application
export async function createChefApplication(applicationData, userId) {
  return await apiFetch(`/ChefApplication?userId=${userId}`, {
    method: "POST",
    body: JSON.stringify(applicationData),
  });
}

// GET: Fetch a single chef application by ID
export async function fetchChefApplicationById(id) {
  return await apiFetch(`/ChefApplication/${id}`);
}

// GET: Fetch all chef applications by user ID
export async function fetchChefApplicationsByUser(userId) {
  return await apiFetch(`/ChefApplication/user/${userId}`);
}

// GET: Fetch all chef applications (admin)
export async function fetchAllChefApplications(status = null) {
  const statusParam = status ? `?status=${status}` : "";
  return await apiFetch(`/ChefApplication${statusParam}`);
}

// PUT: Review a chef application (admin)
export async function reviewChefApplication(id, reviewData) {
  return await apiFetch(`/ChefApplication/${id}/review`, {
    method: "PUT",
    body: JSON.stringify(reviewData),
  });
}

// DELETE: Delete a chef application
export async function deleteChefApplication(id, userId) {
  return await apiFetch(`/ChefApplication/${id}?userId=${userId}`, {
    method: "DELETE",
  });
}