// adminRecipeApi.js
import { apiFetch } from "./apiClient";

// GET: Fetch all recipes
export async function fetchAllRecipes() {
  return await apiFetch("/ManageRecipe");
}

// GET: Fetch recipe by ID
export async function fetchRecipeById(recipeId) {
  return await apiFetch(`/ManageRecipe/${recipeId}`);
}

// PUT: Update recipe
export async function updateRecipe(recipeId, recipeData) {
  return await apiFetch(`/ManageRecipe/update/${recipeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recipeData),
  });
}

// POST: Upload recipe image
export async function uploadRecipeImage(recipeId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token");
  
  const response = await fetch(`http://localhost:5037/api/ManageRecipe/upload-image/${recipeId}`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Failed to upload recipe image" }));
    throw new Error(errorData.message || "Failed to upload recipe image");
  }

  return await response.json();
}

// DELETE: Delete recipe
export async function deleteRecipe(recipeId) {
  return await apiFetch(`/ManageRecipe/delete/${recipeId}`, {
    method: "DELETE",
  });
}



// DELETE: Delete review
export const deleteReview = async (reviewId) => {
  return await apiFetch(`/ManageRecipe/delete-review/${reviewId}`, {
    method: 'DELETE',
  });
};