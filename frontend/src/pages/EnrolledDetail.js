import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CourseSection from "../components/CourseSection";
import LessonContent from "../components/LessonContent";
import QuizSection from "../components/QuizSection";
import chefProfile from "../assets/pfp.png";
import { fetchCourseById } from "../api/courseApi";

function EnrolledDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { chef, course } = location.state || {};

  const [courseSections, setCourseSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!course?.id) {
        console.error("No course ID provided", course);
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching course with ID:", course.id);
        const data = await fetchCourseById(course.id);
        console.log("Fetched course data:", data);
        
        // Map sections from API to component format
        const sections = data.sections.map(section => ({
          id: section.id,
          title: section.sectionTitle,
          contentType: section.contentType,
          content: section.content
        }));

        console.log("Mapped sections:", sections);

        // Add quiz as the last section if quiz questions exist
        if (data.quizQuestions && data.quizQuestions.length > 0) {
          sections.push({
            id: 'quiz',
            title: "Final Quiz",
            contentType: "quiz",
            content: data.quizQuestions.map(q => ({
              question: q.question,
              options: q.options,
              answer: q.answer
            }))
          });
        }

        console.log("Final sections with quiz:", sections);

        setCourseSections(sections);
        if (sections.length > 0) {
          setCurrentSection(sections[0]);
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        alert(`Failed to load course details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [course?.id]);

  const handleNextSection = () => {
    const currentIndex = courseSections.findIndex((s) => s.id === currentSection.id);
    if (currentIndex < courseSections.length - 1) {
      setCurrentSection(courseSections[currentIndex + 1]);
      // Calculate progress: current section / total sections * 100
      setProgress(((currentIndex + 2) / courseSections.length) * 100);
    }
  };

  const handleSectionSelect = (section) => {
    setCurrentSection(section);
    const sectionIndex = courseSections.findIndex((s) => s.id === section.id);
    setProgress(((sectionIndex + 1) / courseSections.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">Loading course...</p>
      </div>
    );
  }

  if (!currentSection) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">No course content available</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-5xl mb-4">
        <button onClick={() => navigate(-1)} className="text-gray-300 hover:text-white">← Back</button>
        <h1 className="text-2xl font-bold">{course?.name || course?.courseName || "Course Detail"}</h1>
        <img 
          src={chef?.chefImage || chefProfile} 
          alt={chef?.chefName || chef?.username} 
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-500" 
        />
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-5xl bg-gray-700 h-3 rounded-full mb-6">
        <div className="bg-green-500 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="flex w-full max-w-5xl gap-6">
        {/* Sidebar */}
        <div className="w-1/4 bg-[#181818] p-4 rounded-xl h-fit">
          <CourseSection
            sections={courseSections}
            currentSection={currentSection}
            onSelect={handleSectionSelect}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#181818] p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">{currentSection.title}</h2>
          
          {currentSection.contentType === "quiz" ? (
            <QuizSection quizData={currentSection.content} />
          ) : (
            <LessonContent section={currentSection} />
          )}

          {currentSection.contentType !== "quiz" && (
            <button
              onClick={handleNextSection}
              className={`mt-6 px-4 py-2 rounded-lg transition-colors ${
                courseSections.findIndex(s => s.id === currentSection.id) === courseSections.length - 1
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
              disabled={courseSections.findIndex(s => s.id === currentSection.id) === courseSections.length - 1}
            >
              {courseSections.findIndex(s => s.id === currentSection.id) === courseSections.length - 1 ? "Course Complete" : "Next"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnrolledDetail;