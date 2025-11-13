import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import postIcon from "../../assets/post.png";
import sampleFood from "../../assets/food.png";
import chefProfile from "../../assets/pfp.png";
import { fetchCoursesByChef, deleteCourse } from "../../api/courseApi";

function ChefCoursePage() {
  const navigate = useNavigate();
  // Get logged-in chef ID from localStorage
  const chefId = parseInt(localStorage.getItem("chefId"));

  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("ChefCoursePage - Chef ID:", chefId);
    loadChefCourses();
  }, [chefId]);

  const loadChefCourses = async () => {
    if (!chefId) {
      setError("You need to be a chef to view courses.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching courses for chef:", chefId);
      const data = await fetchCoursesByChef(chefId);
      console.log("API Response:", data);
      
      // Transform API response to match component format
      const transformedCourses = data.map(course => ({
        id: course.id,
        name: course.courseName,
        courseName: course.courseName,
        image: course.courseImage || sampleFood,
        ingredients: course.ingredients || "N/A",
        difficulty: course.difficulty || "Medium",
        time: course.estimatedTime || "N/A",
        description: course.description || "No description provided.",
        sections: course.sections || [],
        quizQuestions: course.quizQuestions || []
      }));
      
      console.log("Transformed courses:", transformedCourses);
      setMyCourses(transformedCourses);
      setError(null);
    } catch (err) {
      console.error("Error loading chef courses:", err);
      setError("Failed to load your courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = () => {
    navigate("/addcourse");
  };

  const handleEditCourse = (courseId) => {
    navigate(`/editcourse/${courseId}`);
  };

  const handleDeleteCourse = async (courseId, courseName) => {
    if (!window.confirm(`Are you sure you want to delete "${courseName}"?`)) {
      return;
    }

    try {
      await deleteCourse(courseId);
      alert("Course deleted successfully!");
      loadChefCourses(); // Reload the courses
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course. Please try again.");
    }
  };

  const handleImageError = (e) => {
    e.target.src = sampleFood;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 m-0 p-0" style={{ overflowX: "hidden" }}>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl text-gray-400">Loading your courses...</p>
        </div>
      </div>
    );
  }

  // Check if user is a chef
  if (!chefId) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 m-0 p-0" style={{ overflowX: "hidden" }}>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-xl text-red-400 mb-4">You need to be a chef to access this page.</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Go Home
            </button>
          </div>
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
          <h1 className="text-center text-3xl font-bold mb-8">
            My Courses
          </h1>
        </div>

        {error && (
          <div className="w-11/12 max-w-6xl bg-red-900 text-white p-4 rounded-lg mb-4">
            <p className="mb-2">{error}</p>
            <button 
              onClick={loadChefCourses}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg"
            >
              Retry Loading Courses
            </button>
          </div>
        )}

        {/* Check if chef has any courses */}
        {myCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <p className="text-gray-400 text-lg mb-6">
              Nothing to show here... Start by adding a new course!
            </p>
            <button
              onClick={handleAddCourse}
              className="flex flex-col items-center justify-center hover:scale-105 transition-transform"
            >
              <img
                src={postIcon}
                alt="Add Course"
                className="w-20 h-20 mb-2"
              />
              <span className="text-blue-500 text-lg font-semibold">
                Add Course
              </span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-12 items-center pb-16 w-full px-4">
            <div
              className="w-full max-w-6xl rounded-2xl p-6 shadow-lg"
              style={{ backgroundColor: "#181818" }}
            >
              {/* Chef Header */}
              <div className="flex items-center mb-6">
                <img
                  src={chefProfile}
                  alt="Chef Profile"
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h2 className="text-2xl font-semibold">
                    My Courses ({myCourses.length})
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Manage and edit your cooking courses
                  </p>
                </div>
              </div>

              {/* Course List */}
              <div className="flex overflow-x-auto space-x-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900 pb-4 px-2">
                {myCourses.map((course) => (
                  <div
                    key={course.id}
                    className="min-w-[320px] bg-[#1f1f1f] rounded-xl shadow-md flex-shrink-0 hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={course.image || sampleFood}
                      alt={course.name}
                      className="w-full h-48 object-cover rounded-t-xl"
                      onError={handleImageError}
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs px-2 py-1 bg-blue-600 rounded-full">
                          {course.difficulty}
                        </span>
                        <span className="text-xs text-gray-400">
                          {course.time}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        {course.name}
                      </h3>
                      
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <p className="text-sm text-gray-400 mb-3">
                        <span className="font-semibold">Ingredients:</span>{" "}
                        {course.ingredients.length > 50 
                          ? `${course.ingredients.substring(0, 50)}...` 
                          : course.ingredients}
                      </p>

                      {/* Course Stats */}
                      <div className="flex justify-between text-xs text-gray-400 mb-4">
                        <span>
                          {course.sections?.length || 0} sections
                        </span>
                        <span>
                          {course.quizQuestions?.length || 0} quiz questions
                        </span>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCourse(course.id)}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id, course.name)}
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Course Button (when chef already has courses) */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleAddCourse}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <img src={postIcon} alt="Add" className="w-6 h-6" />
                  <span className="text-white font-semibold">Add New Course</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {myCourses.length > 0 && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {myCourses.length} course{myCourses.length !== 1 ? 's' : ''} loaded successfully
        </div>
      )}
    </div>
  );
}

export default ChefCoursePage;