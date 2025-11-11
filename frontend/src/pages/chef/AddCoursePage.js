import React, { useState } from "react";
import { X, Plus, Image, Video, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { createCourse } from "../../api/courseApi";

function AddCoursePage() {
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState("");
  const [courseImage, setCourseImage] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  
  // Section form state
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionContentType, setSectionContentType] = useState("text");
  const [sectionContent, setSectionContent] = useState("");
  const [editingSection, setEditingSection] = useState(null);
  
  // Quiz form state
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""]);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [editingQuiz, setEditingQuiz] = useState(null);

  const addSection = () => {
    if (!sectionTitle || !sectionContent) {
      alert("Please fill in all section fields");
      return;
    }

    const newSection = {
      id: editingSection !== null ? editingSection : Date.now(),
      title: sectionTitle,
      contentType: sectionContentType,
      content: sectionContent
    };

    if (editingSection !== null) {
      setSections(sections.map(s => s.id === editingSection ? newSection : s));
    } else {
      setSections([...sections, newSection]);
    }

    resetSectionForm();
  };

  const resetSectionForm = () => {
    setSectionTitle("");
    setSectionContentType("text");
    setSectionContent("");
    setEditingSection(null);
    setShowSectionModal(false);
  };

  const editSection = (section) => {
    setSectionTitle(section.title);
    setSectionContentType(section.contentType);
    setSectionContent(section.content);
    setEditingSection(section.id);
    setShowSectionModal(true);
  };

  const deleteSection = (id) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const addQuizQuestion = () => {
    if (!quizQuestion || quizOptions.some(opt => !opt) || !quizAnswer) {
      alert("Please fill in all quiz fields");
      return;
    }

    const newQuestion = {
      id: editingQuiz !== null ? editingQuiz : Date.now(),
      question: quizQuestion,
      options: [...quizOptions],
      answer: quizAnswer
    };

    if (editingQuiz !== null) {
      setQuizQuestions(quizQuestions.map(q => q.id === editingQuiz ? newQuestion : q));
    } else {
      setQuizQuestions([...quizQuestions, newQuestion]);
    }

    resetQuizForm();
  };

  const resetQuizForm = () => {
    setQuizQuestion("");
    setQuizOptions(["", "", "", ""]);
    setQuizAnswer("");
    setEditingQuiz(null);
    setShowQuizModal(false);
  };

  const editQuiz = (quiz) => {
    setQuizQuestion(quiz.question);
    setQuizOptions([...quiz.options]);
    setQuizAnswer(quiz.answer);
    setEditingQuiz(quiz.id);
    setShowQuizModal(true);
  };

  const deleteQuiz = (id) => {
    setQuizQuestions(quizQuestions.filter(q => q.id !== id));
  };

  const handleSubmitCourse = async () => {
    if (!courseName || !description || sections.length === 0 || quizQuestions.length === 0) {
      alert("Please fill in course name, description, add at least one section, and at least one quiz question");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format data to match the API DTO structure
      const courseData = {
        courseName: courseName,
        courseImage: courseImage || "",
        ingredients: ingredients || "",
        difficulty: difficulty,
        estimatedTime: time || "",
        description: description,
        sections: sections.map((section, index) => ({
          sectionTitle: section.title,
          contentType: section.contentType,
          content: section.content,
          sectionOrder: index + 1
        })),
        quizQuestions: quizQuestions.map((quiz, index) => ({
          question: quiz.question,
          option1: quiz.options[0],
          option2: quiz.options[1],
          option3: quiz.options[2],
          option4: quiz.options[3],
          correctAnswer: quiz.answer,
          questionOrder: index + 1
        }))
      };

      const response = await createCourse(courseData);
      console.log("Course created:", response);
      alert("Course created successfully!");
      navigate("/chef-courses");
    } catch (error) {
      console.error("Error creating course:", error);
      alert(`Failed to create course: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pl-24 m-0 p-0" style={{ overflowX: "hidden" }}>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Add New Course</h1>

        {/* Basic Course Info */}
        <div className="bg-[#181818] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Course Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Course Name *</label>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="e.g., Beef Wellington"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Course Image URL</label>
              <input
                type="text"
                value={courseImage}
                onChange={(e) => setCourseImage(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ingredients</label>
              <input
                type="text"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="e.g., Beef, pastry, mushrooms, butter"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., 2 hrs"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 h-24"
                placeholder="Describe your course..."
              />
            </div>
          </div>
        </div>

        {/* Course Sections */}
        <div className="bg-[#181818] rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Course Sections *</h2>
            <button
              onClick={() => setShowSectionModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              Add Section
            </button>
          </div>

          {sections.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No sections added yet</p>
          ) : (
            <div className="space-y-3">
              {sections.map((section, index) => (
                <div key={section.id} className="bg-[#1f1f1f] rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{index + 1}. {section.title}</p>
                    <p className="text-sm text-gray-400 capitalize">Type: {section.contentType}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editSection(section)}
                      className="text-blue-400 hover:text-blue-300 px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="text-red-400 hover:text-red-300 px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz Questions */}
        <div className="bg-[#181818] rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quiz Questions *</h2>
            <button
              onClick={() => setShowQuizModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              Add Question
            </button>
          </div>

          {quizQuestions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No quiz questions added yet</p>
          ) : (
            <div className="space-y-3">
              {quizQuestions.map((quiz, index) => (
                <div key={quiz.id} className="bg-[#1f1f1f] rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium mb-2">{index + 1}. {quiz.question}</p>
                      <p className="text-sm text-green-400">Answer: {quiz.answer}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editQuiz(quiz)}
                        className="text-blue-400 hover:text-blue-300 px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteQuiz(quiz.id)}
                        className="text-red-400 hover:text-red-300 px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitCourse}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Course"}
          </button>
        </div>
      </div>

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#181818] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editingSection ? "Edit Section" : "Add New Section"}
              </h3>
              <button onClick={resetSectionForm}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Section Title</label>
                <input
                  type="text"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Introduction, Step 1, Preparation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content Type</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSectionContentType("text")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      sectionContentType === "text"
                        ? "bg-blue-600"
                        : "bg-[#1f1f1f] hover:bg-gray-700"
                    }`}
                  >
                    <FileText size={20} />
                    Text
                  </button>
                  <button
                    onClick={() => setSectionContentType("image")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      sectionContentType === "image"
                        ? "bg-blue-600"
                        : "bg-[#1f1f1f] hover:bg-gray-700"
                    }`}
                  >
                    <Image size={20} />
                    Image
                  </button>
                  <button
                    onClick={() => setSectionContentType("video")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      sectionContentType === "video"
                        ? "bg-blue-600"
                        : "bg-[#1f1f1f] hover:bg-gray-700"
                    }`}
                  >
                    <Video size={20} />
                    Video
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {sectionContentType === "text"
                    ? "Content Text"
                    : `${sectionContentType.charAt(0).toUpperCase() + sectionContentType.slice(1)} URL`}
                </label>
                {sectionContentType === "text" ? (
                  <textarea
                    value={sectionContent}
                    onChange={(e) => setSectionContent(e.target.value)}
                    className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 h-32"
                    placeholder="Enter the lesson content..."
                  />
                ) : (
                  <input
                    type="text"
                    value={sectionContent}
                    onChange={(e) => setSectionContent(e.target.value)}
                    className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder={`https://example.com/${sectionContentType === "image" ? "image.jpg" : "video.mp4"}`}
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={resetSectionForm}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={addSection}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  {editingSection ? "Update Section" : "Add Section"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#181818] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editingQuiz ? "Edit Quiz Question" : "Add Quiz Question"}
              </h3>
              <button onClick={resetQuizForm}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question</label>
                <input
                  type="text"
                  value={quizQuestion}
                  onChange={(e) => setQuizQuestion(e.target.value)}
                  className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Enter your question..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Options</label>
                {quizOptions.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...quizOptions];
                      newOptions[idx] = e.target.value;
                      setQuizOptions(newOptions);
                    }}
                    className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:border-blue-500"
                    placeholder={`Option ${idx + 1}`}
                  />
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Correct Answer</label>
                <select
                  value={quizAnswer}
                  onChange={(e) => setQuizAnswer(e.target.value)}
                  className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select correct answer</option>
                  {quizOptions.map((opt, idx) => (
                    opt && <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={resetQuizForm}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={addQuizQuestion}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                >
                  {editingQuiz ? "Update Question" : "Add Question"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddCoursePage;