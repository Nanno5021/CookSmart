import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import sampleFood from "../assets/food.png";
import chefProfile from "../assets/pfp.png";
import { fetchAllCourses } from "../api/courseApi";
import { enrollInCourse, getEnrollmentsByUser } from "../api/enrollmentApi";

function CoursePage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [userEnrollments, setUserEnrollments] = useState([]);

  // Get current user ID from localStorage
  const currentUserId = parseInt(localStorage.getItem("userId"));
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    if (currentUserId) {
      loadCourses();
      loadUserEnrollments();
    } else {
      setLoading(false);
      setError("Please log in to view courses");
    }
  }, [currentUserId]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await fetchAllCourses();
      
      const groupedCourses = data.reduce((acc, course) => {
        const existingChef = acc.find(c => c.chefId === course.chefId);
        
        const courseData = {
          id: course.id,
          name: course.courseName,
          image: course.courseImage || sampleFood,
          ingredients: course.ingredients || "N/A",
          difficulty: course.difficulty || "Medium",
          time: course.estimatedTime || "N/A",
          description: course.description || "No description provided.",
          sections: course.sections,
          quizQuestions: course.quizQuestions
        };

        if (existingChef) {
          existingChef.courses.push(courseData);
        } else {
          acc.push({
            chefId: course.chefId,
            chefName: course.chefName,
            chefImage: course.chefImage || chefProfile,
            courses: [courseData]
          });
        }
        
        return acc;
      }, []);
      
      setCourses(groupedCourses);
      setError(null);
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const loadUserEnrollments = async () => {
    if (!currentUserId) return;
    
    try {
      const enrollments = await getEnrollmentsByUser(currentUserId);
      setUserEnrollments(enrollments);
    } catch (err) {
      console.error("Error loading enrollments:", err);
    }
  };

  // ✅ FIXED: Handle course enrollment (separate from navigation)
  const handleEnrollInCourse = async (courseId) => {
    if (!currentUserId) {
      setError("Please log in to enroll in courses");
      return;
    }

    try {
      await enrollInCourse(currentUserId, courseId);
      await loadUserEnrollments(); // Refresh enrollments
      alert("Successfully enrolled in the course!");
    } catch (err) {
      console.error("Error enrolling in course:", err);
      setError(err.message || "Failed to enroll in course");
    }
  };

  // ✅ FIXED: Navigation logic - check enrollment status first
  const goToCourseDetail = (chef, course) => {
    const isEnrolled = userEnrollments.some(e => e.courseId === course.id);
    
    if (filter === "enrolled" && isEnrolled) {
      // If in "Enrolled Courses" tab AND enrolled, go to enrolled detail page
      navigate("/enrolleddetail", { 
        state: { 
          chef: {
            chefId: chef.chefId,
            chefName: chef.chefName,
            chefImage: chef.chefImage
          }, 
          course: {
            id: course.id,
            name: course.name,
            courseName: course.name,
            ...course
          } 
        } 
      });
    } else {
      // If in "All Courses" tab OR not enrolled, go to course detail page
      navigate("/coursedetail", { 
        state: { 
          chef: {
            chefId: chef.chefId,
            chefName: chef.chefName,
            chefImage: chef.chefImage
          }, 
          course: {
            id: course.id,
            name: course.name,
            courseName: course.name,
            ...course
          } 
        } 
      });
    }
  };

  // Filter displayed courses based on database enrollments
  const displayedCourses =
    filter === "all"
      ? courses
      : courses
          .map((chef) => ({
            ...chef,
            courses: chef.courses.filter((course) =>
              userEnrollments.some(
                (enrollment) => enrollment.courseId === course.id
              )
            ),
          }))
          .filter((chef) => chef.courses.length > 0);

  // ... rest of your component (loading, error, return JSX) remains the same
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 m-0 p-0" style={{ overflowX: "hidden" }}>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 m-0 p-0" style={{ overflowX: "hidden" }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <button 
            onClick={loadCourses}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black text-white pl-24 m-0 p-0"
      style={{ overflowX: "hidden" }}
    >
      <Navbar />

      <div className="w-full flex flex-col items-center pt-4">
        <div className="w-full flex flex-col items-center">
          <h1 className="text-center text-3xl font-bold mb-4">Chef Courses</h1>

          {/* Filter buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              All Courses
            </button>
            <button
              onClick={() => setFilter("enrolled")}
              className={`px-4 py-2 rounded-lg ${
                filter === "enrolled"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Enrolled Courses ({userEnrollments.length})
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-12 items-center pb-16 w-full px-8">
          {displayedCourses.length > 0 ? (
            displayedCourses.map((chef) => (
              <div
                key={chef.chefId}
                className="w-full max-w-6xl rounded-2xl p-8 shadow-lg"
                style={{ backgroundColor: "#181818" }}
              >
                {/* Chef Header */}
                <div className="flex items-center mb-8">
                  <img
                    src={chef.chefImage || chefProfile}
                    alt={chef.chefName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
                  />
                  <div className="ml-6">
                    <h2 className="text-2xl font-semibold">{chef.chefName}</h2>
                  </div>
                </div>

                {/* Chef Courses (Horizontal Scroll) */}
                <div className="flex overflow-x-auto space-x-8 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900 pb-4 px-2">
                  {chef.courses.map((course, index) => {
                    const enrollment = userEnrollments.find(e => e.courseId === course.id);
                    const isEnrolled = !!enrollment;
                    
                    return (
                      <div
                        key={course.id || index}
                        onClick={() => goToCourseDetail(chef, course)}
                        className="min-w-[340px] rounded-xl overflow-hidden shadow-md transition transform hover:scale-105 hover:shadow-lg flex-shrink-0 cursor-pointer flex flex-col"
                        style={{ backgroundColor: "#1f1f1f" }}
                      >
                        <img
                          src={course.image || sampleFood}
                          alt={course.name}
                          className="w-full h-52 object-cover"
                        />
                        <div className="p-5 flex-1 flex flex-col">
                          <p className="text-sm text-gray-400 mb-3">
                            Ingredients: {course.ingredients || "N/A"}
                          </p>
                          <h3 className="text-lg font-semibold mb-2">
                            {course.name}
                          </h3>
                          <p className="text-gray-300 text-sm flex-1">
                            {course.description || "No description provided."}
                          </p>
                          
                          {/* Enrollment Status */}
                          {isEnrolled && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-green-400 font-semibold">
                                  ✓ Enrolled
                                </span>
                                {enrollment.progress > 0 && (
                                  <span className="text-blue-400">
                                    Progress: {Math.round(enrollment.progress * 100)}%
                                  </span>
                                )}
                              </div>
                              {enrollment.completed && (
                                <div className="mt-1 text-xs text-yellow-400 font-semibold">
                                  🎉 Course Completed!
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="mt-4 pt-3 border-t border-gray-700">
                            <div className="flex justify-between items-center text-xs text-gray-400">
                              <span>Difficulty: {course.difficulty}</span>
                              <span>Time: {course.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 mt-20 text-lg">
              {filter === "enrolled"
                ? "No enrolled courses yet."
                : "No courses available yet."}
            </p>
          )}
        </div>
      </div>
      
{/* Request Chef Account Button */}
      {userRole !== "Admin" && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => navigate("/requestchef")}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full shadow-lg font-semibold transition"
          >
            Request Chef Account
          </button>
        </div>
      )}
    </div>
  );
}

export default CoursePage;