// comment.js
import { apiFetch } from "./apiClient";

// Fetch comments for a post
export async function fetchComments(postId) {
  try {
    return await apiFetch(`/posts/${postId}/comments`, {
      method: "GET",
    });
  } catch (error) {
    console.warn(`Comments endpoint not available for post ${postId}:`, error);
    return []; // Return empty array if endpoint doesn't exist
  }
}

// Create a new comment
export async function createComment(postId, content, parentCommentId = null) {
  try {
    return await apiFetch(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({
        content,
        parentCommentId,
      }),
    });
  } catch (error) {
    console.error("Failed to create comment:", error);
    throw new Error("Comment functionality is not available");
  }
}

// Like a comment
export async function likeComment(postId, commentId) {
  try {
    return await apiFetch(`/posts/${postId}/comments/${commentId}/like`, {
      method: "POST",
    });
  } catch (error) {
    console.warn("Like comment endpoint not available:", error);
    throw new Error("Like functionality is not available");
  }
}

// Delete a comment
export async function deleteComment(postId, commentId) {
  try {
    return await apiFetch(`/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.warn("Delete comment endpoint not available:", error);
    throw new Error("Delete functionality is not available");
  }
}

export async function fetchMyComments() {
  try {
    return await apiFetch("/users/my-comments", {
      method: "GET",
    });
  } catch (error) {
    console.warn("Failed to fetch user comments:", error);
    return [];
  }
}