import { apiFetch } from "./apiClient";

// GET reviews by recipe
export async function fetchReviewsByRecipe(recipeId) {
  return await apiFetch(`/recipereviews/recipe/${recipeId}`);
}

// POST create review
export async function createRecipeReview(reviewData, userId) {
  return await apiFetch(`/recipereviews?userId=${userId}`, {
    method: "POST",
    body: JSON.stringify(reviewData),
  });
}

// PUT update review
export async function updateRecipeReview(reviewId, reviewData, userId) {
  return await apiFetch(`/recipereviews/${reviewId}?userId=${userId}`, {
    method: "PUT",
    body: JSON.stringify(reviewData),
  });
}

// DELETE review
export async function deleteRecipeReview(reviewId, userId) {
  return await apiFetch(`/recipereviews/${reviewId}?userId=${userId}`, {
    method: "DELETE",
  });
}