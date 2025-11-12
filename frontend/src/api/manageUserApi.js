// manageUserApi.js - FIXED VERSION
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newRole),
  });
}

// GET: Fetch user by ID
export async function fetchUserById(userId) {
  return await apiFetch(`/ManageUser/users/${userId}`);
}

// PUT: Update user profile - FIXED
export async function updateUser(userId, userData) {
  return await apiFetch(`/ManageUser/update/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
}

// POST: Upload user avatar - FIXED
export async function uploadAvatar(userId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token");
  
  const response = await fetch(`http://localhost:5037/api/ManageUser/upload-avatar/${userId}`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // Remove Content-Type header for FormData - browser will set it automatically with boundary
    },
    body: formData, 
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to upload avatar" }));
    throw new Error(errorData.message || "Failed to upload avatar");
  }

  return await response.json();
}

// POST: Reset user avatar to default - FIXED
export async function resetAvatar(userId) {
  return await apiFetch(`/ManageUser/reset-avatar/${userId}`, {
    method: "POST",
  });
}


export async function deleteChefProfile(userId) {
  return await apiFetch(`/ManageUser/delete-chef/${userId}`, {
    method: "DELETE",
  });
}

export async function uploadCertificationImage(userId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token");
  
  const response = await fetch(`http://localhost:5037/api/ManageUser/upload-certification/${userId}`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to upload certification image" }));
    throw new Error(errorData.message || "Failed to upload certification image");
  }

  return await response.json();
}

// Update the createChefProfile function to handle file upload
export async function createChefProfile(userId, chefData) {
  let certificationImageUrl = '';

  // If there's a certification image file, upload it first
  if (chefData.certificationImage) {
    const uploadResult = await uploadCertificationImage(userId, chefData.certificationImage);
    certificationImageUrl = uploadResult.certificationImageUrl;
  }

  // Prepare the chef data for submission
  const submissionData = {
    specialtyCuisine: chefData.specialtyCuisine,
    yearsOfExperience: chefData.yearsOfExperience,
    certificationName: chefData.certificationName,
    certificationImageUrl: certificationImageUrl,
    portfolioLink: chefData.portfolioLink,
    biography: chefData.biography,
  };

  return await apiFetch(`/ManageUser/create-chef/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submissionData),
  });
}

// PUT: Update chef profile
export async function updateChefProfile(userId, chefData) {
  return await apiFetch(`/ManageUser/update-chef/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chefData),
  });
}