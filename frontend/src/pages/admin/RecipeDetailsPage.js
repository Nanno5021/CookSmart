import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Clock, Star, Trash2, Edit, Utensils } from 'lucide-react';
import { fetchRecipeById, deleteReview } from '../../api/adminRecipeApi';

function RecipeDetailsPage({ recipeId, onBack, onEdit }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingReview, setDeletingReview] = useState(null);

  useEffect(() => {
    loadRecipeDetails();
  }, [recipeId]);

  const loadRecipeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRecipeById(recipeId);
      setRecipe(data);
    } catch (err) {
      setError(err.message || 'Failed to load recipe details');
    } finally {
      setLoading(false);
    }
  };

const handleDeleteReview = async (reviewId) => {
  if (!window.confirm('Are you sure you want to delete this review?')) {
    return;
  }

  try {
    setDeletingReview(reviewId);
    await deleteReview(reviewId);
    await loadRecipeDetails(); // Reload to get updated reviews
    alert('Review deleted successfully!');
  } catch (err) {
    alert(err.message || 'Failed to delete review');
  } finally {
    setDeletingReview(null);
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
          <span>Back to Recipes</span>
        </button>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-gray-400">Loading recipe details…</p>
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
          <span>Back to Recipes</span>
        </button>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadRecipeDetails}
            className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Recipes</span>
        </button>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-gray-400">Recipe not found</p>
        </div>
      </div>
    );
  }

  const ingredients = recipe.ingredients.split(',').filter(ing => ing.trim());
  const steps = recipe.steps.split('\n').filter(step => step.trim());

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Recipes</span>
        </button>
        
        <button
          onClick={() => onEdit(recipeId)}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition inline-flex items-center space-x-2"
        >
          <Edit size={18} />
          <span>Edit Recipe</span>
        </button>
      </div>

      {/* Recipe Header */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 mb-6">
        <div className="flex items-start space-x-8">
          {/* Recipe Image */}
          <div className="flex-shrink-0">
            {recipe.recipeImage ? (
              <img
                src={recipe.recipeImage}
                alt={recipe.recipeName}
                className="w-64 h-64 rounded-xl object-cover"
              />
            ) : (
              <div className="w-64 h-64 rounded-xl bg-zinc-800 flex items-center justify-center">
                <Utensils size={48} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Recipe Info */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4">{recipe.recipeName}</h2>
            
            {/* Chef Info */}
            <div className="flex items-center space-x-3 mb-4">
              {recipe.chefAvatar ? (
                <img
                  src={recipe.chefAvatar}
                  alt={recipe.chefName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <User size={20} className="text-gray-400" />
                </div>
              )}
              <div>
                <p className="text-gray-400">By</p>
                <p className="font-medium">{recipe.chefName}</p>
              </div>
            </div>

            {/* Recipe Stats */}
            <div className="flex items-center space-x-6 mb-4">
              <div className="flex items-center space-x-2">
                <Star size={20} className="text-yellow-500 fill-current" />
                <span className="font-medium">{recipe.averageRating.toFixed(1)}</span>
                <span className="text-gray-400">({recipe.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-gray-400" />
                <span className="text-gray-400">
                  Created {new Date(recipe.createdAt).toLocaleDateString()}
                </span>
              </div>
              <span className="px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded-full text-sm">
                {recipe.cuisine}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingredients Section */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-xl font-bold mb-4">Ingredients</h3>
          <ul className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center space-x-3 text-gray-400">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>{ingredient.trim()}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps Section */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-xl font-bold mb-4">Cooking Steps</h3>
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={index} className="flex space-x-3">
                <span className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <p className="text-gray-400 pt-1">{step.trim()}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Reviews Section */}
      {recipe.reviews.length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mt-6">
          <h3 className="text-xl font-bold mb-4">Reviews ({recipe.reviews.length})</h3>
          <div className="space-y-4">
            {recipe.reviews.map((review) => (
              <div key={review.id} className="border-b border-zinc-800 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 mb-2">
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                        <User size={16} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{review.userName}</p>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-600'}
                          />
                        ))}
                        <span className="text-gray-400 text-sm ml-2">
                          {new Date(review.reviewDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={deletingReview === review.id}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg transition text-sm disabled:opacity-50"
                  >
                    {deletingReview === review.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
                {review.comment && (
                  <p className="text-gray-400 mt-2 ml-11">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipeDetailsPage;