import { apiFetch } from "./apiClient";

export async function enrollInCourse(userId, courseId) {
  return await apiFetch("/Enrollment", { 
    method: "POST",
    body: JSON.stringify({ userId, courseId }),
  });
}

// GET: Check if user is enrolled in a course - FIXED
export async function isUserEnrolled(userId, courseId) {
  return await apiFetch(`/Enrollment/user/${userId}/enrolled?courseId=${courseId}`); 
}

// GET: Get all enrollments for a user - FIXED
export async function getEnrollmentsByUser(userId) {
  return await apiFetch(`/Enrollment/user/${userId}`); 
}

// GET: Get specific enrollment by user and course - FIXED
export async function getEnrollmentByUserAndCourse(userId, courseId) {
  return await apiFetch(`/Enrollment/user/${userId}/course/${courseId}`); 
}

// PUT: Update enrollment progress - FIXED
export async function updateEnrollment(id, progressData) {
  return await apiFetch(`/Enrollment/${id}`, { 
    method: "PUT",
    body: JSON.stringify(progressData),
  });
}

// DELETE: Unenroll from course - FIXED
export async function deleteEnrollment(id) {
  return await apiFetch(`/Enrollment/${id}`, { 
    method: "DELETE",
  });
}

// GET: Get enrollment by ID - FIXED
export async function getEnrollmentById(id) {
  return await apiFetch(`/Enrollment/${id}`); 
}

// GET: Get all enrollments for a course - FIXED
export async function getEnrollmentsByCourse(courseId) {
  return await apiFetch(`/Enrollment/course/${courseId}`); 
}