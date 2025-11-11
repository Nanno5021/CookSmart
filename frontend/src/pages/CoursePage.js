import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import sampleFood from "../assets/food.png";
import chefProfile from "../assets/pfp.png";

function CoursePage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("all"); // "all" or "enrolled"
  const [enrolledCourses, setEnrolledCourses] = useState(
    JSON.parse(localStorage.getItem("enrolledCourses")) || []
  );

  useEffect(() => {
    setCourses([
      {
        chefId: 1,
        chefName: "Chef Gordon Ramsay",
        chefImage: chefProfile,
        courses: [
          {
            name: "Beef Wellington",
            image: sampleFood,
            ingredients: "Beef, pastry, mushrooms, butter",
            difficulty: "Hard",
            time: "2 hrs",
            description:
              "Learn the art of making the perfect Beef Wellington step by step.",
          },
          {
            name: "Scrambled Eggs",
            image: sampleFood,
            ingredients: "Eggs, butter, salt",
            difficulty: "Easy",
            time: "10 mins",
            description:
              "Master creamy scrambled eggs with professional techniques.",
          },
        ],
      },
      {
        chefId: 2,
        chefName: "Nigella Lawson",
        chefImage: chefProfile,
        courses: [
          {
            name: "Chocolate Cake",
            image: sampleFood,
            ingredients: "Cocoa, flour, sugar, butter",
            difficulty: "Medium",
            time: "1 hr",
            description: "Bake a rich, indulgent chocolate cake.",
          },
        ],
      },
    ]);
  }, []);

  // Navigate to course detail
  const goToCourseDetail = (chef, course) => {
    navigate("/coursedetail", { state: { chef, course } });
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
                      key={index}
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
    </div>
  );
}

export default CoursePage;
