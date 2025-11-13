import React, { useState, useEffect } from 'react';
import { fetchAllCourses, deleteCourse } from '../../api/courseApi';
import { Eye, Trash2, Edit, Clock, Star, BookOpen, Search } from 'lucide-react';
import EditCoursePage from './EditCoursePage';
import CourseDetailsPage from './CourseDetailsPage';

function ManageCoursePage() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Delete Dialog
  const [deleteCourseId, setDeleteCourseId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course =>
        course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.chefName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.difficulty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.ingredients?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllCourses();
      setCourses(data);
      setFilteredCourses(data);
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE COURSE ---
  const openDeleteDialog = (id) => {
    setDeleteCourseId(id);
  };

  const performDelete = async () => {
    try {
      setDeleting(true);
      await deleteCourse(deleteCourseId);
      setCourses(prev => prev.filter(course => course.id !== deleteCourseId));
      setDeleteCourseId(null);
      alert('Course deleted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to delete course');
    } finally {
      setDeleting(false);
    }
  };

  // --- VIEW DETAILS ---
  const handleViewDetails = (id) => setSelectedCourseId(id);
  
  // --- EDIT COURSE ---
  const handleEditCourse = (id) => setEditingCourseId(id);

  const handleBackToList = () => {
    setSelectedCourseId(null);
    setEditingCourseId(null);
    loadCourses();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Show details or edit page
  if (selectedCourseId || editingCourseId) {
    if (editingCourseId) {
      return (
        <EditCoursePage 
          courseId={editingCourseId} 
          onBack={handleBackToList} 
          onSave={loadCourses}
        />
      );
    }
    if (selectedCourseId) {
      return (
        <CourseDetailsPage
          courseId={selectedCourseId}
          onBack={handleBackToList}
          onEdit={setEditingCourseId}
        />
      );
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={loadCourses} />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Manage Courses</h2>
        <div className="relative w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by course, chef, difficulty..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition"
          />
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          {searchTerm ? (
            <div>
              <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-2">No courses found matching "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-orange-500 hover:text-orange-400 transition"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div>
              <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No courses found</p>
            </div>
          )}
        </div>
      ) : (
        <CoursesTable
          courses={filteredCourses}
          onViewDetails={handleViewDetails}
          onEditCourse={handleEditCourse}
          onDeleteCourse={openDeleteDialog}
          searchTerm={searchTerm}
        />
      )}

      {/* ---------- DELETE COURSE DIALOG ---------- */}
      {deleteCourseId !== null && (
        <Modal onClose={() => setDeleteCourseId(null)}>
          <h3 className="text-xl font-bold mb-4">Delete Course</h3>
          <p className="text-gray-400 mb-6">
            Are you sure you want to delete this course? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteCourseId(null)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={performDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Yes, Delete Course'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8">Manage Courses</h2>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
        <p className="text-gray-400">Loading courses…</p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8">Manage Courses</h2>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function CoursesTable({ courses, onViewDetails, onEditCourse, onDeleteCourse, searchTerm }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      {searchTerm && (
        <div className="px-4 py-3 bg-zinc-800 border-b border-zinc-700">
          <p className="text-sm text-gray-400">
            Showing {courses.length} course{courses.length !== 1 ? 's' : ''} for "{searchTerm}"
          </p>
        </div>
      )}
      <table className="w-full">
        <thead className="bg-zinc-800">
          <tr>
            <th className="text-left p-4 font-semibold">Course Name</th>
            <th className="text-left p-4 font-semibold">Chef</th>
            <th className="text-left p-4 font-semibold">Difficulty</th>
            <th className="text-left p-4 font-semibold">Time</th>
            <th className="text-left p-4 font-semibold">Sections</th>
            <th className="text-left p-4 font-semibold">Created Date</th>
            <th className="text-center p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id} className="border-t border-zinc-800 hover:bg-zinc-800 transition-colors">
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  {course.courseImage ? (
                    <img
                      src={course.courseImage}
                      alt={course.courseName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                  <span className="font-medium">{course.courseName}</span>
                </div>
              </td>
              <td className="p-4 text-gray-400">{course.chefName || 'Unknown Chef'}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  course.difficulty === 'Easy' 
                    ? 'bg-green-500 bg-opacity-20 text-green-400'
                    : course.difficulty === 'Medium'
                    ? 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                    : 'bg-red-500 bg-opacity-20 text-red-400'
                }`}>
                  {course.difficulty}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-1 text-gray-400">
                  <Clock size={16} />
                  <span>{course.estimatedTime}</span>
                </div>
              </td>
              <td className="p-4 text-gray-400">
                {course.sections ? course.sections.length : 0} sections
              </td>
              <td className="p-4 text-gray-400">
                {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Unknown'}
              </td>
              <td className="p-4">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => onViewDetails(course.id)}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition inline-flex items-center space-x-1"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => onEditCourse(course.id)}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition inline-flex items-center space-x-1"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => onDeleteCourse(course.id)}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition inline-flex items-center space-x-1"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 max-w-lg w-full p-6">
        {children}
      </div>
    </div>
  );
}

export default ManageCoursePage;