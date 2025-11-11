import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import chefProfile from "../assets/pfp.png"; // placeholder user
import sampleFood from "../assets/food.png"; // placeholder image

function RecipeDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get recipe data safely (fallbacks included)
  const recipe = {
    id: location.state?.recipe?.id || 1,
    name: location.state?.recipe?.name || "Spaghetti Carbonara",
    cuisine: location.state?.recipe?.cuisine || "Italian",
    image: location.state?.recipe?.image || sampleFood,
    ingredients:
      location.state?.recipe?.ingredients || [
        "Pasta",
        "Egg",
        "Bacon",
        "Cheese",
        "Pepper",
      ],
    steps:
      location.state?.recipe?.steps || [
        "Boil pasta until al dente.",
        "Cook bacon until crispy, then remove excess oil.",
        "Whisk eggs and cheese in a bowl.",
        "Combine hot pasta with egg mixture and bacon.",
        "Season with black pepper and serve.",
      ],
  };

  // Mock reviews
  const mockReviews = [
    {
      id: 1,
      username: "Foodie123",
      userProfile: chefProfile,
      rating: 5,
      comment: "Absolutely delicious! Easy to follow steps.",
      date: "2024-11-10",
    },
    {
      id: 2,
      username: "ChefLover",
      userProfile: chefProfile,
      rating: 4,
      comment: "Loved it, maybe a bit salty but great overall.",
      date: "2024-11-09",
    },
  ];

  const [reviews, setReviews] = useState(mockReviews);
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle review submit
  const handleSubmitReview = () => {
    if (myRating === 0 || myReview.trim() === "") {
      alert("Please provide both a rating and review!");
      return;
    }

    setIsSubmitting(true);
    const newReview = {
      id: reviews.length + 1,
      username: "You",
      userProfile: chefProfile,
      rating: myRating,
      comment: myReview,
      date: new Date().toISOString(),
    };

    setTimeout(() => {
      setReviews([newReview, ...reviews]);
      setMyRating(0);
      setMyReview("");
      setIsSubmitting(false);
    }, 800);
  };

  const totalRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-black text-white pl-24 flex justify-center relative">
      <Navbar />

      <div className="w-full max-w-3xl mt-8 p-6 rounded-2xl shadow-lg bg-[#181818] relative">
        {/* Header Section */}
        <div className="relative mb-6">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-64 object-cover rounded-xl"
          />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-lg"
          >
            Back
          </button>
          <div className="bottom-5 left-4 text-2xl font-bold">
            {recipe.name}
          </div>
        </div>

        {/* Cuisine + Ingredients */}
        <p className="text-gray-400 mb-2">Cuisine: {recipe.cuisine}</p>
        <p className="text-gray-400 mb-4">
          Ingredients:{" "}
          <span className="text-gray-300">
            {recipe.ingredients.join(", ")}
          </span>
        </p>

        {/* Steps */}
        <h2 className="text-xl font-semibold mb-2">Step-by-Step Guide</h2>
        <ol className="list-decimal ml-6 text-gray-300 space-y-2 mb-8">
          {(recipe.steps || ["No steps provided."]).map((step, i) => (
            <li key={i}>{step}</li>
          ))}
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
                : "bg-gray-600 hover:bg-blue-500"
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
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-[#222] rounded-lg p-4 flex gap-3 items-start"
            >
              <img
                src={r.userProfile}
                alt={r.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{r.username}</span>
                  <span className="text-yellow-400">
                    {"★".repeat(r.rating)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    ({formatDate(r.date)})
                  </span>
                </div>
                <p className="text-gray-300 mt-1">{r.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecipeDetailPage;
