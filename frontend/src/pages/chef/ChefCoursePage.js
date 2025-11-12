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
      const data = await fetchCoursesByChef(chefId);
      
      // Transform API response to match component format
      const transformedCourses = data.map(course => ({
        id: course.id,
        name: course.courseName,
        image: course.courseImage || sampleFood,
        ingredients: course.ingredients || "N/A",
        difficulty: course.difficulty || "Medium",
        time: course.estimatedTime || "N/A",
        description: course.description || "No description provided.",
        sections: course.sections,
        quizQuestions: course.quizQuestions
      }));
      
      setMyCourses(transformedCourses);
      setError(null);
    } catch (err) {
      console.error("Error loading chef courses:", err);
      setError("Failed to load your courses.");
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
          <div className="w-11/12 bg-red-900 text-white p-4 rounded-lg mb-4">
            <p>{error}</p>
            <button 
              onClick={loadChefCourses}
              className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {/* Check if chef has any courses */}
        {myCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <p className="text-gray-400 text-lg mb-6">
              Nothing to show here... Start by adding new course!
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
          <div className="flex flex-col gap-12 items-center pb-16 w-full">
            <div
              className="w-11/12 rounded-2xl p-6 shadow-lg"
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
                    My Courses
                  </h2>
                </div>
              </div>

              {/* Course List */}
              <div className="flex overflow-x-auto space-x-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900 pb-4">
                {myCourses.map((course) => (
                  <div
                    key={course.id}
                    className="min-w-[320px] bg-[#1f1f1f] rounded-xl shadow-md flex-shrink-0"
                  >
                    <img
                      src={course.image || sampleFood}
                      alt={course.name}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                    <div className="p-4">
                      <p className="text-sm text-gray-400 mb-2">
                        Ingredients: {course.ingredients}
                      </p>
                      <h3 className="text-lg font-semibold mb-1">
                        {course.name}
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">
                        {course.description}
                      </p>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleEditCourse(course.id)}
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id, course.name)}
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
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
    </div>
  );
}

export default ChefCoursePage;