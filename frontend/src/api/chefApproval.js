import { apiFetch } from "./apiClient";

export async function getPendingApplications() {
  return await apiFetch("/ChefApproval/pending", {
    method: "GET",
  });
}

export async function approveApplication(id) {
  return await apiFetch(`/ChefApproval/approve/${id}`, {
    method: "POST",
  });
}

export async function rejectApplication(id, remarks) {
  return await apiFetch(`/ChefApproval/reject/${id}`, {
    method: "POST",
    body: JSON.stringify(remarks),
  });
}

export async function getAllApplications() {
  return await apiFetch("/ChefApproval/all", {
    method: "GET",
  });
}

export async function getApplicationById(id) {
  return await apiFetch(`/ChefApproval/${id}`, {
    method: "GET",
  });
}