import { apiFetch } from "./apiClient";

// GET: Fetch reviews by course ID
export async function fetchReviewsByCourse(courseId) {
  return await apiFetch(`/reviews/course/${courseId}`);
}

// POST: Create a new review
export async function createReview(reviewData, userId) {
  return await apiFetch(`/reviews?userId=${userId}`, {
    method: "POST",
    body: JSON.stringify(reviewData),
  });
}

// PUT: Update a review
export async function updateReview(reviewId, reviewData, userId) {
  return await apiFetch(`/reviews/${reviewId}?userId=${userId}`, {
    method: "PUT",
    body: JSON.stringify(reviewData),
  });
}

// DELETE: Delete a review
export async function deleteReview(reviewId, userId) {
  return await apiFetch(`/reviews/${reviewId}?userId=${userId}`, {
    method: "DELETE",
  });
}