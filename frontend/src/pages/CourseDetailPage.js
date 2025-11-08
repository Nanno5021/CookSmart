import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import chefProfile from "../assets/pfp.png"; // placeholder chef profile
import sampleFood from "../assets/food.png"; // placeholder course image

function CourseDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { chef, course } = location.state || {
    chef: { chefName: "Unknown", chefImage: chefProfile },
    course: {
      name: "Unknown",
      image: sampleFood,
      ingredients: "N/A",
      difficulty: "Easy",
      time: "30 mins",
      description: "No description available.",
    },
  };

  // Reviews
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [reviews, setReviews] = useState([
    {
      id: 1,
      username: "Alice",
      profilePic: chefProfile,
      rating: 5,
      date: "2025-11-01",
      comment: "Amazing course! Learned a lot.",
    },
    {
      id: 2,
      username: "Bob",
      profilePic: chefProfile,
      rating: 4,
      date: "2025-11-03",
      comment: "Great instructions, but took longer than expected.",
    },
  ]);

  // Enrollment state
  const [enrolledCourses, setEnrolledCourses] = useState(
    JSON.parse(localStorage.getItem("enrolledCourses")) || []
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if this course is enrolled
  const isEnrolled = enrolledCourses.some(
    (c) => c.chefId === chef.chefId && c.courseName === course.name
  );

  // Enroll / Unenroll handler
  const toggleEnroll = () => {
    if (isEnrolled) {
      // Unenroll
      const newEnrolled = enrolledCourses.filter(
        (c) => !(c.chefId === chef.chefId && c.courseName === course.name)
      );
      setEnrolledCourses(newEnrolled);
      localStorage.setItem("enrolledCourses", JSON.stringify(newEnrolled));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } else {
      // Show confirmation dialog to enroll
      setIsDialogOpen(true);
    }
  };

  const confirmEnroll = () => {
    const newEnrolled = [
      ...enrolledCourses,
      { chefId: chef.chefId, courseName: course.name },
    ];
    setEnrolledCourses(newEnrolled);
    localStorage.setItem("enrolledCourses", JSON.stringify(newEnrolled));
    setIsDialogOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Review submission
  const handleSubmitReview = () => {
    if (!isEnrolled) {
      alert("You must enroll in this course to submit a review.");
      return;
    }
    if (myRating === 0 || myReview.trim() === "") {
      alert("Please provide a rating and review.");
      return;
    }
    const newReview = {
      id: reviews.length + 1,
      username: "You",
      profilePic: chefProfile,
      rating: myRating,
      date: new Date().toLocaleDateString(),
      comment: myReview,
    };
    setReviews([newReview, ...reviews]);
    setMyRating(0);
    setMyReview("");
  };

  const totalRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

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

          {/* Enroll / Unenroll Button */}
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
                }`}
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
              isEnrolled ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-600 cursor-not-allowed"
            }`}
            disabled={!isEnrolled}
          >
            Submit
          </button>

          {/* Total Rating */}
          <p className="mt-4 text-gray-400">
            Total Rating: {totalRating.toFixed(1)} / 5 ({reviews.length} reviews)
          </p>

          {/* Reviews */}
          <h2 className="text-xl font-semibold mt-4 mb-2">Reviews</h2>
          <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto">
            {reviews.map((rev) => (
              <div key={rev.id} className="flex gap-3 p-3 bg-[#222] rounded-lg items-start">
                <img
                  src={rev.profilePic || chefProfile}
                  alt={rev.username}
                  className="w-10 h-10 rounded-full object-cover mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{rev.username}</span>
                    <span className="text-yellow-400">{'★'.repeat(rev.rating)}</span>
                    <span className="text-gray-400 text-sm">({rev.date})</span>
                  </div>
                  <p className="text-gray-300">{rev.comment}</p>
                </div>
              </div>
            ))}
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
            {isEnrolled ? "Unenrolled successfully!" : "Enrolled successfully!"}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseDetailPage;
