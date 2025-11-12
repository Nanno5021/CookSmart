import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import chefProfile from "../assets/pfp.png";
import sampleFood from "../assets/food.png";
import { fetchRecipeById } from "../api/recipeApi";
import { fetchReviewsByRecipe, createRecipeReview, updateRecipeReview, deleteRecipeReview } from "../api/recipeReviewApi";

function RecipeDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { recipeId } = useParams();

  // Get current user ID from localStorage
  const currentUserId = parseInt(localStorage.getItem("userId"));

  // Recipe state
  const [recipe, setRecipe] = useState(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Edit state
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  // Fetch recipe data
  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setIsLoadingRecipe(true);
        
        // Try to get recipe from location state first (from navigation)
        if (location.state?.recipe) {
          setRecipe(location.state.recipe);
        } 
        // Otherwise fetch from API using recipeId from URL
        else if (recipeId) {
          const data = await fetchRecipeById(recipeId);
          setRecipe(data);
        }
      } catch (error) {
        console.error("Error loading recipe:", error);
        alert("Failed to load recipe");
        navigate("/recipes");
      } finally {
        setIsLoadingRecipe(false);
      }
    };

    loadRecipe();
  }, [recipeId, location.state, navigate]);

  // Fetch reviews from API
  useEffect(() => {
    if (recipe?.id) {
      loadReviews();
    }
  }, [recipe?.id]);

  const loadReviews = async () => {
    try {
      setIsLoadingReviews(true);
      const data = await fetchReviewsByRecipe(recipe.id);
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Handle review submit
  const handleSubmitReview = async () => {
    if (!currentUserId) {
      alert("Please log in to submit a review");
      navigate("/login");
      return;
    }

    if (myRating === 0 || myReview.trim() === "") {
      alert("Please provide both a rating and review!");
      return;
    }

    try {
      setIsSubmitting(true);
      const reviewData = {
        recipeId: recipe.id,
        rating: myRating,
        comment: myReview,
      };
      
      const newReview = await createRecipeReview(reviewData, currentUserId);
      
      setReviews([newReview, ...reviews]);
      setMyRating(0);
      setMyReview("");
      setSuccessMessage("Review submitted successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Error submitting review:", error);
      
      if (error.message && error.message.includes("already reviewed")) {
        alert("You have already reviewed this recipe");
      } else {
        alert("Failed to submit review. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit review
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
      
      const updatedReview = await updateRecipeReview(editingReview, reviewData, currentUserId);
      
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

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await deleteRecipeReview(reviewId, currentUserId);
      setReviews(reviews.filter(review => review.id !== reviewId));
      setSuccessMessage("Review deleted successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  const totalRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading state
  if (isLoadingRecipe) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 flex justify-center items-center">
        <Navbar />
        <p className="text-xl text-gray-400">Loading recipe...</p>
      </div>
    );
  }

  // No recipe found
  if (!recipe) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 flex justify-center items-center">
        <Navbar />
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">Recipe not found</p>
          <button
            onClick={() => navigate("/recipes")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pl-24 flex justify-center relative">
      <Navbar />

      <div className="w-full max-w-3xl mt-8 p-6 rounded-2xl shadow-lg bg-[#181818] relative">
        {/* Header Section */}
        <div className="relative mb-6">
          <img
            src={recipe.recipeImage || sampleFood}
            alt={recipe.recipeName}
            className="w-full h-64 object-cover rounded-xl"
            onError={(e) => {
              e.target.src = sampleFood;
            }}
          />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-lg"
          >
            Back
          </button>
        </div>

        {/* Recipe Title and Chef Info */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">{recipe.recipeName}</h1>
          <p className="text-gray-400">
            By Chef: <span className="text-white font-medium">{recipe.chefName}</span>
          </p>
        </div>

        {/* Cuisine + Ingredients */}
        <p className="text-gray-400 mb-2">
          Cuisine: <span className="text-white">{recipe.cuisine}</span>
        </p>
        <div className="mb-4">
          <p className="text-gray-400 mb-2">Ingredients:</p>
          <div className="text-gray-300 ml-4">
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <ul className="list-disc ml-4 space-y-1">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No ingredients listed</p>
            )}
          </div>
        </div>

        {/* Steps */}
        <h2 className="text-xl font-semibold mb-2">Step-by-Step Guide</h2>
        <ol className="list-decimal ml-6 text-gray-300 space-y-2 mb-8">
          {recipe.steps && recipe.steps.length > 0 ? (
            recipe.steps.map((step, i) => <li key={i}>{step}</li>)
          ) : (
            <li className="text-gray-500">No steps provided</li>
          )}
        </ol>

        {/* Rating Section */}
        <h2 className="text-xl font-semibold mb-2">Rate this Recipe</h2>
        <div className="flex items-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setMyRating(star)}
              className={`text-2xl ${
                myRating >= star ? "text-yellow-400" : "text-gray-600"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={myReview}
          onChange={(e) => setMyReview(e.target.value)}
          rows={3}
          placeholder="Write your review..."
          className="w-full bg-gray-900 text-white p-3 rounded-lg resize-none focus:outline-none"
        ></textarea>

        <div className="flex justify-end mt-3">
          <button
            onClick={handleSubmitReview}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg font-semibold ${
              isSubmitting
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>

        {/* Total Rating */}
        <p className="mt-6 text-gray-400">
          Total Rating: {totalRating.toFixed(1)} / 5 ({reviews.length} reviews)
        </p>

        {/* Reviews */}
        <h2 className="text-xl font-semibold mt-4 mb-3">Reviews</h2>
        <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto">
          {isLoadingReviews ? (
            <p className="text-gray-400 text-center">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-400 text-center">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="bg-[#222] rounded-lg p-4 flex gap-3 items-start"
              >
                <img
                  src={r.userProfileImage || chefProfile}
                  alt={r.username}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = chefProfile;
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{r.username}</span>
                      <span className="text-yellow-400">
                        {"★".repeat(r.rating)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({formatDate(r.reviewDate)})
                      </span>
                    </div>
                    {/* Edit/Delete buttons for current user's reviews */}
                    {r.userId === currentUserId && (
                      <div className="flex gap-2">
                        {editingReview === r.id ? (
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
                              onClick={() => handleEditReview(r)}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(r.id)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {editingReview === r.id ? (
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
                    <p className="text-gray-300 mt-1">{r.comment}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed bottom-10 right-10 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {successMessage}
        </div>
      )}
    </div>
  );
}

export default RecipeDetailPage;