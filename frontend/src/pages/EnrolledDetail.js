import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CourseSection from "../components/CourseSection";
import LessonContent from "../components/LessonContent";
import QuizSection from "../components/QuizSection";
import chefProfile from "../assets/pfp.png";

function EnrolledDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { chef, course } = location.state || {};

  // Define course structure
  const courseSections = [
    {
      id: 1,
      title: "Introduction to the Dish",
      contentType: "text",
      content: "Welcome to this cooking course! Today, you’ll learn how to make the perfect Beef Wellington...",
    },
    {
      id: 2,
      title: "Preparation Steps",
      contentType: "image",
      content: "/assets/prep_steps.png", // sample image path
    },
    {
      id: 3,
      title: "Cooking Tutorial Video",
      contentType: "video",
      content: "/assets/wellington_tutorial.mp4",
    },
    {
      id: 4,
      title: "Final Quiz",
      contentType: "quiz",
      content: [
        {
          question: "What temperature should the oven be preheated to?",
          options: ["180°C", "200°C", "220°C", "250°C"],
          answer: "220°C",
        },
        {
          question: "Which ingredient gives the crust its flaky texture?",
          options: ["Butter", "Sugar", "Oil", "Milk"],
          answer: "Butter",
        },
      ],
    },
  ];

  const [currentSection, setCurrentSection] = useState(courseSections[0]);
  const [progress, setProgress] = useState(0);

  const handleNextSection = () => {
    const currentIndex = courseSections.findIndex((s) => s.id === currentSection.id);
    if (currentIndex < courseSections.length - 1) {
      setCurrentSection(courseSections[currentIndex + 1]);
      setProgress(((currentIndex + 1) / (courseSections.length - 1)) * 100);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-5xl mb-4">
        <button onClick={() => navigate(-1)} className="text-gray-300 hover:text-white">← Back</button>
        <h1 className="text-2xl font-bold">{course?.name || "Course Detail"}</h1>
        <img src={chef?.chefImage || chefProfile} alt={chef?.chefName} className="w-12 h-12 rounded-full border-2 border-gray-500" />
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-5xl bg-gray-700 h-3 rounded-full mb-6">
        <div className="bg-green-500 h-3 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="flex w-full max-w-5xl gap-6">
        {/* Sidebar */}
        <div className="w-1/4 bg-[#181818] p-4 rounded-xl h-fit">
          <CourseSection
            sections={courseSections}
            currentSection={currentSection}
            onSelect={setCurrentSection}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#181818] p-6 rounded-xl shadow-lg">
          {currentSection.contentType === "quiz" ? (
            <QuizSection quizData={currentSection.content} />
          ) : (
            <LessonContent section={currentSection} />
          )}

          {currentSection.contentType !== "quiz" && (
            <button
              onClick={handleNextSection}
              className="mt-6 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnrolledDetail;
