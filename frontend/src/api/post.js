import { apiFetch } from "./apiClient";

// Fetch all posts
export async function fetchPosts() {
  return await apiFetch("/posts", {
    method: "GET",
  });
}

// Create a new post
export async function createPost(postData) {
  return await apiFetch("/posts", {
    method: "POST",
    body: JSON.stringify(postData),
  });
}

export async function uploadPostImage(file) {
  const token = localStorage.getItem("token");
  if (!file) throw new Error("No file provided");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:5037/api/posts/upload", { // <-- use your API port
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // DO NOT set Content-Type for FormData!
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Image upload failed");
  }

  return res.json(); // returns { imageUrl: "..." }
}
