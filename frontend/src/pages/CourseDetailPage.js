import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import chefProfile from "../assets/pfp.png";
import sampleFood from "../assets/food.png";
import { fetchReviewsByCourse, createReview, updateReview, deleteReview } from "../api/courseReviewApi";
import { enrollInCourse, getEnrollmentsByUser, deleteEnrollment } from "../api/enrollmentApi";

function resolveAvatarUrl(raw) {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return `${window.location.origin}${raw}`;
  return `${window.location.origin}/${raw}`;
}

function pickAvatarFromReview(review) {
  const candidates = [
    review.userProfileImage,
    review.avatarUrl,
    review.avatar,
    review.profilePic,
    review.image,
    review.userAvatar,
    review.authorAvatar,
    review.author?.avatarUrl,
    review.user?.avatarUrl,
  ];
  const first = candidates.flat?.().find(Boolean) ?? candidates.find(Boolean);
  return first ? resolveAvatarUrl(first) : null;
}

function ReviewAvatar({ review, size = 40 }) {
  const avatarUrl = pickAvatarFromReview(review);
  const userName = review.username || "User";
  
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={userName}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  
  // Fallback to initials
  const initials = userName.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold"
      style={{
        width: size,
        height: size,
        backgroundColor: "#2a2a2a",
        fontSize: size * 0.4
      }}
    >
      {initials}
    </div>
  );
}

function CourseDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { chef, course } = location.state || {
    chef: { chefName: "Unknown", chefImage: chefProfile },
    course: {
      id: null,
      name: "Unknown",
      image: sampleFood,
      ingredients: "N/A",
      difficulty: "Easy",
      time: "30 mins",
      description: "No description available.",
    },
  };

  const currentUserId = parseInt(localStorage.getItem("userId")) || 1;


  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(true);

  const isEnrolled = userEnrollments.some(
    (enrollment) => enrollment.courseId === course.id
  );

  useEffect(() => {
    if (course.id) {
      loadReviews();
      loadUserEnrollments();
    }
  }, [course.id]);

  const loadReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const data = await fetchReviewsByCourse(course.id);
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const loadUserEnrollments = async () => {
    if (!currentUserId) return;
    
    try {
      setIsLoadingEnrollments(true);
      const enrollments = await getEnrollmentsByUser(currentUserId);
      setUserEnrollments(enrollments);
    } catch (err) {
      console.error("Error loading enrollments:", err);
      setUserEnrollments([]);
    } finally {
      setIsLoadingEnrollments(false);
    }
  };
  
  const toggleEnroll = async () => {
    if (isEnrolled) {
      const enrollment = userEnrollments.find(e => e.courseId === course.id);
      if (enrollment) {
        if (window.confirm(`Are you sure you want to unenroll from "${course.name}"?`)) {
          try {
            await deleteEnrollment(enrollment.id);
            await loadUserEnrollments();
            setSuccessMessage("Unenrolled successfully!");
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
          } catch (error) {
            console.error("Error unenrolling from course:", error);
            alert("Failed to unenroll from course: " + (error.message || "Please try again."));
          }
        }
      } else {
        alert("Enrollment record not found. Please try refreshing the page.");
      }
    } else {
      setIsDialogOpen(true);
    }
  };

  // ✅ FIXED: Confirm enroll - CALL DATABASE API
  const confirmEnroll = async () => {
    if (!currentUserId) {
      alert("Please log in to enroll in courses");
      return;
    }

    try {
      // Call the enrollment API
      await enrollInCourse(currentUserId, course.id);
      
      // Refresh enrollments from database
      await loadUserEnrollments();
      
      setIsDialogOpen(false);
      setSuccessMessage("Enrolled successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      alert("Failed to enroll in course: " + (error.message || "Please try again."));
      setIsDialogOpen(false);
    }
  };

  // Review submission (rest of the code remains the same)
  const handleSubmitReview = async () => {
    if (!isEnrolled) {
      alert("You must enroll in this course to submit a review.");
      return;
    }
    if (myRating === 0 || myReview.trim() === "") {
      alert("Please provide a rating and review.");
      return;
    }

    try {
      setIsSubmitting(true);
      const reviewData = {
        courseId: course.id,
        rating: myRating,
        comment: myReview,
      };
      
      const newReview = await createReview(reviewData, currentUserId);
      
      setReviews([newReview, ...reviews]);
      setMyRating(0);
      setMyReview("");
      setSuccessMessage("Review submitted successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Error submitting review:", error);
      
      if (error.message && error.message.includes("already reviewed")) {
        alert("You have already reviewed this course");
      } else {
        alert("Failed to submit review. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of your review functions remain the same
  const handleEditReview = (review) => {
    setEditingReview(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdateReview = async () => {
    if (editRating === 0 || editComment.trim() === "") {
      alert("Please provide a rating and review.");
      return;
    }

    try {
      const reviewData = {
        rating: editRating,
        comment: editComment,
      };
      
      const updatedReview = await updateReview(editingReview, reviewData, currentUserId);
      
      setReviews(reviews.map(review => 
        review.id === editingReview ? updatedReview : review
      ));
      setEditingReview(null);
      setEditRating(0);
      setEditComment("");
      setSuccessMessage("Review updated successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Failed to update review. Please try again.");
    }
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setEditRating(0);
    setEditComment("");
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await deleteReview(reviewId, currentUserId);
      setReviews(reviews.filter(review => review.id !== reviewId));
      setSuccessMessage("Review deleted successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  // Calculate total rating
  const totalRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Show loading while checking enrollment status
  if (isLoadingEnrollments) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <p className="text-xl">Loading course details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-start p-4">
      <div className="w-full max-w-3xl relative">
        {/* Course Image */}
        <div className="relative">
          <img
            src={course.image || sampleFood}
            alt={course.name}
            className="w-full h-64 object-cover rounded-t-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/80 rounded-t-xl"></div>

          {/* Course Name */}
          <h1 className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white text-center px-4">
            {course.name}
          </h1>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-lg"
          >
            Back
          </button>

          {/* ✅ FIXED: Enroll / Unenroll Button - based on database enrollment */}
          <button
            onClick={toggleEnroll}
            className={`absolute top-4 right-4 px-3 py-1 rounded-lg ${
              isEnrolled ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"
            } text-white`}
          >
            {isEnrolled ? "Unenroll" : "Enroll"}
          </button>
        </div>

        {/* Course Details */}
        <div className="bg-[#181818] rounded-b-xl -mt-6 p-6 shadow-lg flex flex-col gap-4">
          {/* Chef Info */}
          <div className="flex items-center gap-4 mb-4">
            <img
              src={chef.chefImage || chefProfile}
              alt={chef.chefName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white"
            />
            <span className="text-lg font-semibold text-white">{chef.chefName}</span>
          </div>

          {/* Ingredients, Difficulty, Time */}
          <p className="text-gray-400 mb-1">Ingredients: {course.ingredients}</p>
          <p className="text-gray-400 text-sm">
            Difficulty: {course.difficulty || "Medium"} | Estimated Time: {course.time || "N/A"}
          </p>

          {/* Overview */}
          <h2 className="text-xl font-semibold mt-4 mb-2">Overview</h2>
          <p className="text-gray-300">{course.description}</p>

          {/* My Rating */}
          <h2 className="text-xl font-semibold mt-6 mb-2">My Rating</h2>
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => isEnrolled && setMyRating(star)}
                className={`text-2xl ${
                  myRating >= star ? "text-yellow-400" : "text-gray-500"
                } ${isEnrolled ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
                ★
              </button>
            ))}
          </div>

          {/* My Review */}
          <h2 className="text-xl font-semibold mt-4 mb-2">My Review</h2>
          <textarea
            value={myReview}
            onChange={(e) => isEnrolled && setMyReview(e.target.value)}
            rows={3}
            placeholder={isEnrolled ? "Write your review..." : "Enroll to write a review"}
            className={`w-full p-3 rounded-lg resize-none text-white focus:outline-none ${
              isEnrolled ? "bg-gray-900" : "bg-gray-800 cursor-not-allowed"
            }`}
            disabled={!isEnrolled}
          />
          <button
            onClick={handleSubmitReview}
            className={`self-end px-4 py-2 rounded-lg mt-2 text-white ${
              isEnrolled && !isSubmitting
                ? "bg-blue-600 hover:bg-blue-500"
                : "bg-gray-600 cursor-not-allowed"
            }`}
            disabled={!isEnrolled || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>

          {/* Total Rating */}
          <p className="mt-4 text-gray-400">
            Total Rating: {totalRating.toFixed(1)} / 5 ({reviews.length} reviews)
          </p>

          {/* Reviews */}
          <h2 className="text-xl font-semibold mt-4 mb-2">Reviews</h2>
          <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto">
            {isLoadingReviews ? (
              <p className="text-gray-400 text-center">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-gray-400 text-center">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="flex gap-3 p-3 bg-[#222] rounded-lg items-start">
                  <ReviewAvatar review={rev} size={40} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{rev.username}</span>
                        <span className="text-yellow-400">{"★".repeat(rev.rating)}</span>
                        <span className="text-gray-400 text-sm">
                          ({formatDate(rev.reviewDate)})
                        </span>
                      </div>
                      {/* Edit/Delete buttons for current user's reviews */}
                      {rev.userId === currentUserId && (
                        <div className="flex gap-2">
                          {editingReview === rev.id ? (
                            <>
                              <button
                                onClick={handleUpdateReview}
                                className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditReview(rev)}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteReview(rev.id)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {editingReview === rev.id ? (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setEditRating(star)}
                              className={`text-xl ${
                                editRating >= star ? "text-yellow-400" : "text-gray-500"
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          rows={3}
                          className="w-full bg-gray-800 text-white p-2 rounded resize-none focus:outline-none"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-300 mt-1">{rev.comment}</p>
                    )}
                  </div>
                </div>
              )))}
          </div>
        </div>

        {/* Enrollment Confirmation Dialog */}
        {isDialogOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
            <div className="bg-[#222] p-6 rounded-xl text-center w-80 border border-gray-700 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Enroll in this course?</h2>
              <p className="text-gray-400 mb-6">
                Are you sure you want to enroll in {chef.chefName}'s course "{course.name}"?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEnroll}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
                >
                  Enroll
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed bottom-10 right-10 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseDetailPage;