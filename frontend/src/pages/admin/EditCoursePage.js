import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Save, Trash2, Plus, X, Image, Video, FileText, Clock, Star } from 'lucide-react';
import { fetchCourseById, updateCourse, uploadCourseImage, uploadSectionImage } from '../../api/courseApi';

function EditCoursePage({ courseId, onBack, onSave }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    courseName: '',
    ingredients: '',
    difficulty: 'Easy',
    estimatedTime: '',
    description: '',
  });

  // Sections and Quiz state
  const [sections, setSections] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);

  // Modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  
  // Section form state
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionContentType, setSectionContentType] = useState("text");
  const [sectionContent, setSectionContent] = useState("");
  const [sectionImageFile, setSectionImageFile] = useState(null);
  const [sectionImagePreview, setSectionImagePreview] = useState("");
  const [isUploadingSectionImage, setIsUploadingSectionImage] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  
  // Quiz form state
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""]);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [editingQuiz, setEditingQuiz] = useState(null);

  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCourseById(courseId);
      setCourse(data);
      
      setFormData({
        courseName: data.courseName || '',
        ingredients: data.ingredients || '',
        difficulty: data.difficulty || 'Easy',
        estimatedTime: data.estimatedTime || '',
        description: data.description || '',
      });

      // Map sections and quiz questions
      const mappedSections = data.sections.map(section => ({
        id: section.id,
        title: section.sectionTitle,
        contentType: section.contentType,
        content: section.content
      }));
      setSections(mappedSections);
      
      const mappedQuizzes = data.quizQuestions.map(quiz => ({
        id: quiz.id,
        question: quiz.question,
        options: quiz.options,
        answer: quiz.answer
      }));
      setQuizQuestions(mappedQuizzes);
      
    } catch (err) {
      setError(err.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const result = await uploadCourseImage(file);
      
      setCourse(prev => ({ 
        ...prev, 
        courseImage: result.imageUrl 
      }));
      
      alert('Course image uploaded successfully!');
    } catch (err) {
      alert(err.message || 'Failed to upload course image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);

      if (!formData.courseName || !formData.description || sections.length === 0 || quizQuestions.length === 0) {
        alert("Please fill in course name, description, add at least one section, and at least one quiz question");
        return;
      }

      const courseData = {
        courseName: formData.courseName,
        courseImage: course?.courseImage || "",
        ingredients: formData.ingredients || "",
        difficulty: formData.difficulty,
        estimatedTime: formData.estimatedTime || "",
        description: formData.description,
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

      await updateCourse(courseId, courseData);
      alert('Course updated successfully!');
      if (onSave) await onSave();
      onBack();
    } catch (err) {
      console.error('Save error:', err);
      alert(err.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Section handlers
  const addSection = () => {
    if (!sectionTitle || !sectionContent) {
      alert("Please fill in all section fields");
      return;
    }

    if (sectionContentType === "image" && sectionImageFile && !sectionContent) {
      alert("Please upload the selected image before adding the section");
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
    setSectionImageFile(null);
    setSectionImagePreview("");
    setEditingSection(null);
    setShowSectionModal(false);
  };

  const editSection = (section) => {
    setSectionTitle(section.title);
    setSectionContentType(section.contentType);
    setSectionContent(section.content);
    
    if (section.contentType === "image" && section.content) {
      setSectionImagePreview(section.content);
    }
    
    setEditingSection(section.id);
    setShowSectionModal(true);
  };

  const deleteSection = (id) => {
    setSections(sections.filter(s => s.id !== id));
  };

  // Section image handlers
  const handleSectionImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      setSectionImageFile(file);
      setSectionImagePreview(URL.createObjectURL(file));
      setSectionContent("");
    }
  };

  const handleUploadSectionImage = async () => {
    if (!sectionImageFile) {
      alert("Please select an image first");
      return;
    }

    setIsUploadingSectionImage(true);
    try {
      const result = await uploadSectionImage(sectionImageFile);
      setSectionContent(result.imageUrl);
      alert("Section image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading section image:", error);
      alert("Failed to upload section image. Please try again.");
    } finally {
      setIsUploadingSectionImage(false);
    }
  };

  const handleRemoveSectionImage = () => {
    setSectionImageFile(null);
    setSectionImagePreview("");
    setSectionContent("");
  };

  // Quiz handlers
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

  if (loading) {
    return (
      <div className="p-6">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-gray-400">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadCourseDetails}
            className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const courseImageUrl = course?.courseImage;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Courses</span>
        </button>
        <h2 className="text-3xl font-bold">Edit Course</h2>
        <div className="w-32"></div>
      </div>

      {/* Course Image Section */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 mb-6">
        <h3 className="text-xl font-bold mb-6">Course Image</h3>
        
        <div className="flex items-center space-x-8">
          {/* Image Display */}
          <div className="relative">
            {courseImageUrl ? (
              <img
                src={courseImageUrl}
                alt={course.courseName}
                className="w-64 h-64 rounded-xl object-cover border-4 border-zinc-800"
              />
            ) : (
              <div className="w-64 h-64 rounded-xl bg-zinc-800 flex items-center justify-center border-4 border-zinc-700">
                <Image size={48} className="text-gray-400" />
              </div>
            )}
            {uploadingImage && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>

          {/* Image Controls */}
          <div className="flex-1 space-y-4">
            <div>
              <label
                htmlFor="course-image-upload"
                className={`px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition cursor-pointer inline-flex items-center space-x-2 ${
                  uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload size={18} />
                <span>Upload New Image</span>
              </label>
              <input
                id="course-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </div>

            <p className="text-sm text-gray-400">
              Allowed: JPG, JPEG, PNG, GIF • Max size: 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Course Information Form */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 mb-6">
        <h3 className="text-xl font-bold mb-6">Course Information</h3>

        <div className="space-y-6">
          {/* Course Name */}
          <FormField
            label="Course Name"
            name="courseName"
            value={formData.courseName}
            onChange={handleInputChange}
            placeholder="Enter course name"
            required
          />

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Ingredients
            </label>
            <input
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              placeholder="e.g., Beef, pastry, mushrooms, butter"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Difficulty and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Difficulty
              </label>
              <select 
                name="difficulty"
                value={formData.difficulty} 
                onChange={handleInputChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <FormField
                label="Estimated Time"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleInputChange}
                placeholder="e.g., 2 hours"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your course..."
              rows={6}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Course Sections */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Course Sections ({sections.length})</h3>
          <button
            onClick={() => setShowSectionModal(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Section</span>
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No sections added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={section.id} className="border border-zinc-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-orange-400">{index + 1}.</span>
                      <div>
                        <p className="font-medium">{section.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            section.contentType === 'text' 
                              ? 'bg-blue-500 bg-opacity-20 text-blue-400'
                              : section.contentType === 'image'
                              ? 'bg-green-500 bg-opacity-20 text-green-400'
                              : 'bg-purple-500 bg-opacity-20 text-purple-400'
                          }`}>
                            {section.contentType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editSection(section)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded transition text-sm"
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

      {/* Quiz Questions */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Quiz Questions ({quizQuestions.length})</h3>
          <button
            onClick={() => setShowQuizModal(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Question</span>
          </button>
        </div>

        {quizQuestions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No quiz questions added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizQuestions.map((quiz, index) => (
              <div key={quiz.id} className="border border-zinc-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-green-400">{index + 1}.</span>
                      <div>
                        <p className="font-medium">{quiz.question}</p>
                        <div className="mt-2">
                          <p className="text-sm text-gray-400">Options:</p>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {quiz.options.map((option, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">{idx + 1}.</span>
                                <span className="text-sm">{option}</span>
                                {option === quiz.answer && (
                                  <Star size={12} className="text-yellow-500 fill-current" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editQuiz(quiz)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteQuiz(quiz.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded transition text-sm"
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

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          onClick={handleSaveChanges}
          disabled={saving}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Section Modal */}
      {showSectionModal && (
        <Modal onClose={resetSectionForm}>
          <h3 className="text-xl font-bold mb-6">
            {editingSection ? "Edit Section" : "Add New Section"}
          </h3>

          <div className="space-y-4">
            <FormField
              label="Section Title"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="e.g., Introduction, Step 1, Preparation"
            />

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Content Type
              </label>
              <div className="flex gap-2">
                {['text', 'image', 'video'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setSectionContentType(type);
                      if (type !== 'image') {
                        setSectionImageFile(null);
                        setSectionImagePreview("");
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      sectionContentType === type
                        ? "bg-orange-500"
                        : "bg-zinc-800 hover:bg-zinc-700"
                    }`}
                  >
                    {type === 'text' && <FileText size={16} />}
                    {type === 'image' && <Image size={16} />}
                    {type === 'video' && <Video size={16} />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {sectionContentType === "text" ? "Content" :
                 sectionContentType === "image" ? "Upload Image" : "Video URL"}
              </label>
              
              {sectionContentType === "text" ? (
                <textarea
                  value={sectionContent}
                  onChange={(e) => setSectionContent(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  placeholder="Enter section content..."
                  rows={4}
                />
              ) : sectionContentType === "image" ? (
                <div>
                  {sectionImagePreview ? (
                    <div className="space-y-2">
                      <img 
                        src={sectionImagePreview} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleRemoveSectionImage}
                          className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 rounded transition text-sm"
                        >
                          Remove
                        </button>
                        {sectionImageFile && !sectionContent && (
                          <button
                            onClick={handleUploadSectionImage}
                            disabled={isUploadingSectionImage}
                            className="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 rounded transition text-sm disabled:opacity-50"
                          >
                            {isUploadingSectionImage ? "Uploading..." : "Upload"}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition">
                      <Upload size={24} className="text-gray-400 mb-1" />
                      <span className="text-gray-400 text-sm">Select Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSectionImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={sectionContent}
                  onChange={(e) => setSectionContent(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  placeholder="Enter video URL..."
                />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={resetSectionForm}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={addSection}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded transition"
              >
                {editingSection ? "Update Section" : "Add Section"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <Modal onClose={resetQuizForm}>
          <h3 className="text-xl font-bold mb-6">
            {editingQuiz ? "Edit Quiz Question" : "Add Quiz Question"}
          </h3>

          <div className="space-y-4">
            <FormField
              label="Question"
              value={quizQuestion}
              onChange={(e) => setQuizQuestion(e.target.value)}
              placeholder="Enter your question..."
            />

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Options
              </label>
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
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 mb-2 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  placeholder={`Option ${idx + 1}`}
                />
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Correct Answer
              </label>
              <select
                value={quizAnswer}
                onChange={(e) => setQuizAnswer(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition"
              >
                <option value="">Select correct answer</option>
                {quizOptions.map((opt, idx) => (
                  opt && <option key={idx} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={resetQuizForm}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={addQuizQuestion}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded transition"
              >
                {editingQuiz ? "Update Question" : "Add Question"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function FormField({ label, name, type = 'text', value, onChange, placeholder, required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
      />
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1"></div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default EditCoursePage;