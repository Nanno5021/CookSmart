import { apiFetch, getToken } from "./apiClient";

const API_BASE_URL = "http://localhost:5037/api";

// GET: Fetch all courses
export async function fetchAllCourses() {
  return await apiFetch("/courses");
}

// GET: Fetch a single course by ID
export async function fetchCourseById(id) {
  return await apiFetch(`/courses/${id}`);
}

// GET: Fetch courses by chef ID
export async function fetchCoursesByChef(chefId) {
  return await apiFetch(`/courses/chef/${chefId}`);
}

// POST: Create a new course
export async function createCourse(courseData) {
  return await apiFetch("/courses", {
    method: "POST",
    body: JSON.stringify(courseData),
  });
}

// PUT: Update an existing course
export async function updateCourse(id, courseData) {
  return await apiFetch(`/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(courseData),
  });
}

// DELETE: Delete a course
export async function deleteCourse(id) {
  return await apiFetch(`/courses/${id}`, {
    method: "DELETE",
  });
}

// POST: Upload course image
export async function uploadCourseImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/courses/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to upload image" }));
    throw new Error(error.message || "Failed to upload image");
  }

  return await response.json();
}

// POST: Upload section image
export async function uploadSectionImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/courses/upload-section-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to upload section image" }));
    throw new Error(error.message || "Failed to upload section image");
  }

  return await response.json();
}