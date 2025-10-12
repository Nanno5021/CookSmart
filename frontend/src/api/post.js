const API_BASE = "http://localhost:5037/api";

export async function fetchPosts() {
  try {
    const response = await fetch(`${API_BASE}/posts`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const errorText = await response.text();
        throw new Error(errorText);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch Posts API Error:", error);
    throw error;
  }
}

export async function createPost(formData) {
  try {
    const response = await fetch(`${API_BASE}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }
    return await response.json();
  } catch (error) {
    console.error("Create Post API Error:", error);
    throw error;
  }
}