import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import sampleFood from "../assets/food.png";
import chefProfile from "../assets/pfp.png";
import { fetchAllCourses } from "../api/courseApi";

function CoursePage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" or "enrolled"
  const [enrolledCourses, setEnrolledCourses] = useState(
    JSON.parse(localStorage.getItem("enrolledCourses")) || []
  );

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await fetchAllCourses();
      
      // Transform API response to match the component's expected format
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

  const goToCourseDetail = (chef, course) => {
    if (filter === "enrolled") {
      // Pass the full course object with id
      navigate("/enrolleddetail", { 
        state: { 
          chef: {
            chefId: chef.chefId,
            chefName: chef.chefName,
            chefImage: chef.chefImage
          }, 
          course: {
            id: course.id, // Make sure to pass the course ID
            name: course.name,
            courseName: course.name,
            ...course
          } 
        } 
      });
    } else {
      navigate("/coursedetail", { state: { chef, course } });
    }
  };

  // Filter displayed courses
  const displayedCourses =
    filter === "all"
      ? courses
      : courses
          .map((chef) => ({
            ...chef,
            courses: chef.courses.filter((course) =>
              enrolledCourses.some(
                (enrolled) =>
                  enrolled.chefId === chef.chefId &&
                  enrolled.courseName === course.name
              )
            ),
          }))
          .filter((chef) => chef.courses.length > 0);

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
              Enrolled Courses
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-12 items-center pb-16 w-full">
          {displayedCourses.length > 0 ? (
            displayedCourses.map((chef) => (
              <div
                key={chef.chefId}
                className="w-11/12 rounded-2xl p-6 shadow-lg"
                style={{ backgroundColor: "#181818" }}
              >
                {/* Chef Header */}
                <div className="flex items-center mb-6">
                  <img
                    src={chef.chefImage || chefProfile}
                    alt={chef.chefName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h2 className="text-2xl font-semibold">{chef.chefName}</h2>
                  </div>
                </div>

                {/* Chef Courses (Horizontal Scroll) */}
                <div className="flex overflow-x-auto space-x-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900 pb-4">
                  {chef.courses.map((course, index) => (
                    <div
                      key={course.id || index}
                      onClick={() => goToCourseDetail(chef, course)}
                      className="min-w-[320px] bg-[#1f1f1f] rounded-xl shadow-md flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    >
                      <img
                        src={course.image || sampleFood}
                        alt={course.name}
                        className="w-full h-48 object-cover rounded-t-xl"
                      />
                      <div className="p-4">
                        <p className="text-sm text-gray-400 mb-2">
                          Ingredients: {course.ingredients || "N/A"}
                        </p>
                        <h3 className="text-lg font-semibold mb-1">
                          {course.name}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {course.description || "No description provided."}
                        </p>
                      </div>
                    </div>
                  ))}
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
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => navigate("/requestchef")}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full shadow-lg font-semibold transition"
        >
          Request Chef Account
        </button>
      </div>
    </div>
  );
}

export default CoursePage;