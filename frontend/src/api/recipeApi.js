import { apiFetch, getToken } from "./apiClient";

const API_BASE_URL = "http://localhost:5037/api";

// GET: Fetch all recipes (with optional filters)
export async function fetchAllRecipes(cuisine = null, ingredient = null) {
  const params = new URLSearchParams();
  if (cuisine) params.append('cuisine', cuisine);
  if (ingredient) params.append('ingredient', ingredient);
  
  const queryString = params.toString();
  return await apiFetch(`/recipes${queryString ? `?${queryString}` : ''}`);
}

// GET: Fetch a single recipe by ID
export async function fetchRecipeById(id) {
  return await apiFetch(`/recipes/${id}`);
}

// GET: Fetch recipes by chef ID
export async function fetchRecipesByChef(chefId) {
  return await apiFetch(`/recipes/chef/${chefId}`);
}

// POST: Create a new recipe
export async function createRecipe(recipeData, chefId) {
  return await apiFetch(`/recipes?chefId=${chefId}`, {
    method: "POST",
    body: JSON.stringify(recipeData),
  });
}

// PUT: Update an existing recipe
export async function updateRecipe(id, recipeData) {
  return await apiFetch(`/recipes/${id}`, {
    method: "PUT",
    body: JSON.stringify(recipeData),
  });
}

// DELETE: Delete a recipe
export async function deleteRecipe(id) {
  return await apiFetch(`/recipes/${id}`, {
    method: "DELETE",
  });
}

// POST: Upload recipe image
export async function uploadRecipeImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();

  // ✅ FIXED: Changed from /recipe/ to /recipes/
  const response = await fetch(`${API_BASE_URL}/recipes/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type - browser will set it automatically with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to upload image" }));
    throw new Error(error.message || "Failed to upload image");
  }

  return await response.json();
}