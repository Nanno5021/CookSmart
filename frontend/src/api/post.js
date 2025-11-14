import { apiFetch } from "./apiClient";

// Fetch all posts
export const fetchPosts = async () => {
  try {
    const response = await apiFetch('/posts');
    return response;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Create a new post
export async function createPost(postData) {
  return await apiFetch("/posts", {
    method: "POST",
    body: JSON.stringify(postData),
  });
}

// Delete a post
export async function deletePost(postId) {
  return await apiFetch(`/posts/${postId}`, {
    method: "DELETE",
  });
}

export async function uploadPostImage(file) {
  const token = localStorage.getItem("token");
  if (!file) throw new Error("No file provided");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:5037/api/posts/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Image upload failed");
  }

  return res.json();
}