import { apiFetch } from "./apiClient";

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