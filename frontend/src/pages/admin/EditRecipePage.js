import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, RotateCcw, Save, Utensils, Trash2, Star, User } from 'lucide-react';
import { fetchRecipeById, updateRecipe, uploadRecipeImage, deleteReview } from '../../api/adminRecipeApi';

function EditRecipePage({ recipeId, onBack, onSave }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingReview, setDeletingReview] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    recipeName: '',
    cuisine: '',
    ingredients: '',
    steps: '',
  });

  useEffect(() => {
    loadRecipeDetails();
  }, [recipeId]);

  const loadRecipeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRecipeById(recipeId);
      setRecipe(data);
      setFormData({
        recipeName: data.recipeName || '',
        cuisine: data.cuisine || '',
        ingredients: data.ingredients || '',
        steps: data.steps || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load recipe details');
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

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      await updateRecipe(recipeId, formData);
      alert('Recipe updated successfully!');
      if (onSave) await onSave();
      onBack();
    } catch (err) {
      console.error('Save error:', err);
      alert(err.message || 'Failed to update recipe');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const response = await uploadRecipeImage(recipeId, file);
      
      // Update the recipe state with new image URL
      setRecipe(prev => ({ 
        ...prev, 
        recipeImage: response.recipeImage 
      }));
      
      alert('Recipe image uploaded successfully!');
    } catch (err) {
      alert(err.message || 'Failed to upload recipe image');
    } finally {
      setUploadingImage(false);
      // Clear the input
      e.target.value = '';
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setDeletingReview(reviewId);
      await deleteReview(reviewId);
      
      // Update local state to remove the deleted review
      setRecipe(prev => ({
        ...prev,
        reviews: prev.reviews.filter(review => review.id !== reviewId),
        totalReviews: prev.totalReviews - 1
      }));
      
      alert('Review deleted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    } finally {
      setDeletingReview(null);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
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
          <p className="text-gray-400">Loading recipe details...</p>
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
            onClick={loadRecipeDetails}
            className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const recipeImageUrl = recipe?.recipeImage;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Recipes</span>
        </button>
        <h2 className="text-3xl font-bold">Edit Recipe</h2>
        <div className="w-32"></div>
      </div>

      {/* Recipe Image Section */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 mb-6">
        <h3 className="text-xl font-bold mb-6">Recipe Image</h3>
        
        <div className="flex items-center space-x-8">
          {/* Image Display */}
          <div className="relative">
            {recipeImageUrl ? (
              <img
                src={recipeImageUrl}
                alt={recipe.recipeName}
                className="w-64 h-64 rounded-xl object-cover border-4 border-zinc-800"
              />
            ) : (
              <div className="w-64 h-64 rounded-xl bg-zinc-800 flex items-center justify-center border-4 border-zinc-700">
                <Utensils size={48} className="text-gray-400" />
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
                htmlFor="recipe-image-upload"
                className={`px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition cursor-pointer inline-flex items-center space-x-2 ${
                  uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload size={18} />
                <span>Upload New Image</span>
              </label>
              <input
                id="recipe-image-upload"
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

      {/* Recipe Information Form */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 mb-6">
        <h3 className="text-xl font-bold mb-6">Recipe Information</h3>

        <div className="space-y-6">
          {/* Recipe Name */}
          <FormField
            label="Recipe Name"
            name="recipeName"
            value={formData.recipeName}
            onChange={handleInputChange}
            placeholder="Enter recipe name"
            required
          />

          {/* Cuisine */}
          <FormField
            label="Cuisine"
            name="cuisine"
            value={formData.cuisine}
            onChange={handleInputChange}
            placeholder="e.g., Italian, Chinese, Mexican"
            required
          />

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Ingredients <span className="text-red-400">*</span>
            </label>
            <textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              placeholder="Enter ingredients separated by commas...
Example: 2 cups flour, 1 cup sugar, 3 eggs, 1 tsp vanilla extract"
              rows={6}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
            />
            <p className="text-gray-500 text-sm mt-1">
              Separate ingredients with commas
            </p>
          </div>

          {/* Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Cooking Steps <span className="text-red-400">*</span>
            </label>
            <textarea
              name="steps"
              value={formData.steps}
              onChange={handleInputChange}
              placeholder="Enter cooking steps, one per line...
Example:
Preheat oven to 350°F (175°C)
Mix dry ingredients in a bowl
Add wet ingredients and mix well
Bake for 30 minutes"
              rows={8}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
            />
            <p className="text-gray-500 text-sm mt-1">
              Enter each step on a new line
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-zinc-800">
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
      </div>

      {/* Reviews Management Section */}
      {recipe?.reviews && recipe.reviews.length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
          <h3 className="text-xl font-bold mb-6">
            Reviews Management ({recipe.reviews.length})
          </h3>
          <div className="space-y-4">
            {recipe.reviews.map((review) => (
              <div key={review.id} className="border border-zinc-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
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
                    {review.comment && (
                      <p className="text-gray-400 mt-2 ml-11">{review.comment}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={deletingReview === review.id}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition inline-flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    <span>{deletingReview === review.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Reviews Message */}
      {recipe?.reviews && recipe.reviews.length === 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-gray-400">No reviews yet for this recipe</p>
        </div>
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

export default EditRecipePage;