import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Clock, Star, Trash2, Edit, BookOpen, Video, Image, FileText } from 'lucide-react';
import { fetchCourseById } from '../../api/courseApi';

function CourseDetailsPage({ courseId, onBack, onEdit }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCourseById(courseId);
      setCourse(data);
    } catch (err) {
      setError(err.message || 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Courses</span>
        </button>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-gray-400">Loading course details…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Courses</span>
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

  if (!course) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Courses</span>
        </button>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-gray-400">Course not found</p>
        </div>
      </div>
    );
  }

  const ingredients = course.ingredients ? course.ingredients.split(',').filter(ing => ing.trim()) : [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Courses</span>
        </button>
        
        <button
          onClick={() => onEdit(courseId)}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition inline-flex items-center space-x-2"
        >
          <Edit size={18} />
          <span>Edit Course</span>
        </button>
      </div>

      {/* Course Header */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 mb-6">
        <div className="flex items-start space-x-8">
          {/* Course Image */}
          <div className="flex-shrink-0">
            {course.courseImage ? (
              <img
                src={course.courseImage}
                alt={course.courseName}
                className="w-64 h-64 rounded-xl object-cover"
              />
            ) : (
              <div className="w-64 h-64 rounded-xl bg-zinc-800 flex items-center justify-center">
                <BookOpen size={48} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Course Info */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4">{course.courseName}</h2>
            
            {/* Chef Info */}
            <div className="flex items-center space-x-3 mb-4">
              {course.chefAvatar ? (
                <img
                  src={course.chefAvatar}
                  alt={course.chefName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <User size={20} className="text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-gray-400">By</p>
                <p className="font-medium">{course.chefName || 'Unknown Chef'}</p>
              </div>
            </div>

            {/* Course Stats */}
            <div className="flex items-center space-x-6 mb-4">
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-gray-400" />
                <span className="text-gray-400">{course.estimatedTime}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                course.difficulty === 'Easy' 
                  ? 'bg-green-500 bg-opacity-20 text-green-400'
                  : course.difficulty === 'Medium'
                  ? 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                  : 'bg-red-500 bg-opacity-20 text-red-400'
              }`}>
                {course.difficulty}
              </span>
              <span className="text-gray-400">
                {course.sections?.length || 0} sections
              </span>
              <span className="text-gray-400">
                {course.quizQuestions?.length || 0} quiz questions
              </span>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-400 leading-relaxed">
                {course.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredients Section */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-xl font-bold mb-4">Ingredients</h3>
          {ingredients.length > 0 ? (
            <ul className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center space-x-3 text-gray-400">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>{ingredient.trim()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No ingredients listed</p>
          )}
        </div>

        {/* Quiz Overview Section */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-xl font-bold mb-4">Quiz Questions ({course.quizQuestions?.length || 0})</h3>
          {course.quizQuestions && course.quizQuestions.length > 0 ? (
            <div className="space-y-3">
              {course.quizQuestions.slice(0, 3).map((quiz, index) => (
                <div key={quiz.id} className="border border-zinc-700 rounded-lg p-3">
                  <p className="font-medium text-sm mb-2">{index + 1}. {quiz.question}</p>
                  <p className="text-green-400 text-xs">Answer: {quiz.answer}</p>
                </div>
              ))}
              {course.quizQuestions.length > 3 && (
                <p className="text-gray-400 text-sm text-center">
                  + {course.quizQuestions.length - 3} more questions
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-400">No quiz questions available</p>
          )}
        </div>
      </div>

      {/* Course Sections */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mt-6">
        <h3 className="text-xl font-bold mb-4">Course Sections ({course.sections?.length || 0})</h3>
        {course.sections && course.sections.length > 0 ? (
          <div className="space-y-4">
            {course.sections.map((section, index) => (
              <div key={section.id} className="border border-zinc-700 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">{section.sectionTitle}</h4>
                    <div className="flex items-center space-x-2 mb-3">
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
                    
                    {/* Content Display */}
                    {section.contentType === 'text' && (
                      <p className="text-gray-400 whitespace-pre-wrap">{section.content}</p>
                    )}
                    
                    {section.contentType === 'image' && section.content && (
                      <div className="mt-2">
                        <img 
                          src={section.content} 
                          alt={section.sectionTitle}
                          className="max-w-full h-auto rounded-lg max-h-64 object-cover"
                        />
                      </div>
                    )}
                    
                    {section.contentType === 'video' && section.content && (
                      <div className="mt-2">
                        <div className="bg-zinc-800 rounded-lg p-4">
                          <div className="flex items-center space-x-2 text-gray-400 mb-2">
                            <Video size={16} />
                            <span className="text-sm">Video URL:</span>
                          </div>
                          <a 
                            href={section.content} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm break-all"
                          >
                            {section.content}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">No sections available</p>
        )}
      </div>

      {/* Full Quiz Questions */}
      {course.quizQuestions && course.quizQuestions.length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mt-6">
          <h3 className="text-xl font-bold mb-4">All Quiz Questions</h3>
          <div className="space-y-4">
            {course.quizQuestions.map((quiz, index) => (
              <div key={quiz.id} className="border border-zinc-700 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium mb-3">{quiz.question}</p>
                    
                    {/* Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      {quiz.options && quiz.options.map((option, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`p-2 rounded border ${
                            option === quiz.answer 
                              ? 'border-green-500 bg-green-500 bg-opacity-10' 
                              : 'border-zinc-600 bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">{optIndex + 1}.</span>
                            <span className={option === quiz.answer ? 'text-green-400' : 'text-gray-300'}>
                              {option}
                            </span>
                            {option === quiz.answer && (
                              <Star size={12} className="text-green-400 fill-current" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-green-400 text-sm">
                      <strong>Correct Answer:</strong> {quiz.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetailsPage;