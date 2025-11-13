import { apiFetch } from "./apiClient";

// GET: Fetch all blog posts (Admin)
export async function fetchAllBlogs() {
  return await apiFetch("/admin/posts");
}

// GET: Fetch single blog post by ID (Admin)
export async function fetchBlogById(postId) {
  return await apiFetch(`/admin/posts/${postId}`);
}

// DELETE: Delete a blog post (Admin)
export async function deleteBlog(postId) {
  return await apiFetch(`/admin/posts/${postId}`, {
    method: "DELETE",
  });
}

// PUT: Update blog post status (Admin) - Optional feature
export async function updateBlogStatus(postId, status) {
  return await apiFetch(`/admin/posts/${postId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}


export async function updateBlog(postId, blogData) {
  return await apiFetch(`/admin/posts/${postId}`, {
    method: "PUT",
    body: JSON.stringify(blogData),
  });
}

// POST: Upload blog image (Admin)
export async function uploadBlogImage(postId, file) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`http://localhost:5037/api/admin/posts/${postId}/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Upload failed");
  }

  return await response.json();
}

// DELETE: Remove blog image (Admin)
export async function removeBlogImage(postId) {
  return await apiFetch(`/admin/posts/${postId}/image`, {
    method: "DELETE",
  });
}

export async function fetchBlogComments(postId) {
  return await apiFetch(`/admin/posts/${postId}/comments`);
}

// DELETE: Delete a comment
export async function deleteBlogComment(postId, commentId) {
  return await apiFetch(`/admin/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
  });
}