
import { apiFetch } from "./apiClient";

export async function fetchPosts() {
  return await apiFetch("/posts", {
    method: "GET",
  });
}

export async function createPost(postData) {
  return await apiFetch("/posts", {
    method: "POST",
    body: JSON.stringify(postData),
  });
}
