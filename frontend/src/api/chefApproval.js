import { apiFetch } from "./apiClient";

export async function getPendingApplications() {
  return await apiFetch("/ChefApplication/pending", {
    method: "GET",
  });
}

export async function approveApplication(id) {
  return await apiFetch(`/ChefApplication/approve/${id}`, {
    method: "POST",
  });
}

export async function rejectApplication(id, remarks) {
  return await apiFetch(`/ChefApplication/reject/${id}`, {
    method: "POST",
    body: JSON.stringify(remarks),
  });
}

export async function getAllApplications() {
  return await apiFetch("/ChefApplication/all", {
    method: "GET",
  });
}

export async function getApplicationById(id) {
  return await apiFetch(`/ChefApplication/${id}`, {
    method: "GET",
  });
}