import { apiFetch } from "./apiClient";

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