import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X } from "lucide-react";
import Navbar from "../../components/Navbar";
import { createRecipe, uploadRecipeImage } from "../../api/recipeApi";

const CUISINE_TYPES = [
  "Italian",
  "Chinese", 
  "Japanese",
  "Malaysian",
  "Mexican",
  "Indian",
  "Thai",
  "French",
  "American",
  "Mediterranean",
  "Korean",
  "Vietnamese",
  "Other"
];

function AddRecipePage() {
  const navigate = useNavigate();
  
  // Recipe form states
  const [recipeName, setRecipeName] = useState("");
  const [recipeImage, setRecipeImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [cuisine, setCuisine] = useState("");
  const [customCuisine, setCustomCuisine] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const chefId = 2;

  const handleCuisineChange = (e) => {
    const selectedCuisine = e.target.value;
    setCuisine(selectedCuisine);
    if (selectedCuisine !== "Other") {
      setCustomCuisine("");
    }
  };

  const getFinalCuisine = () => {
    return cuisine === "Other" ? customCuisine : cuisine;
  };

  const handleImageSelect = (e) => {
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
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) {
      alert("Please select an image first");
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await uploadRecipeImage(imageFile);
      setRecipeImage(result.imageUrl);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setRecipeImage("");
  };

  const handleSubmitRecipe = async () => {
    const finalCuisine = getFinalCuisine();
    
    if (!recipeName || !ingredients || !steps.trim() || !finalCuisine) {
      alert("Please fill in recipe name, cuisine, ingredients, and steps");
      return;
    }

    // Upload image if file is selected but not uploaded yet
    if (imageFile && !recipeImage) {
      alert("Please upload the selected image before submitting");
      return;
    }

    setIsSubmitting(true);

    const recipeData = {
      recipeName,
      recipeImage: recipeImage || "",
      cuisine: finalCuisine,
      ingredients: ingredients.split(",").map((i) => i.trim()).join(","),
      steps: steps.split("\n").map((s) => s.trim()).filter((s) => s).join("\n"),
    };

    try {
      await createRecipe(recipeData, chefId);
      alert("Recipe added successfully!");
      navigate("/chefrecipe");
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert("Failed to add recipe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pl-24">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Add New Recipe</h1>

        <div className="bg-[#181818] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Recipe Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recipe Name *</label>
              <input
                type="text"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="e.g., Spaghetti Carbonara"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cuisine *</label>
              <select
                value={cuisine}
                onChange={handleCuisineChange}
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select a cuisine</option>
                {CUISINE_TYPES.map((cuisineType) => (
                  <option key={cuisineType} value={cuisineType}>
                    {cuisineType}
                  </option>
                ))}
              </select>
              
              {cuisine === "Other" && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customCuisine}
                    onChange={(e) => setCustomCuisine(e.target.value)}
                    className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Enter custom cuisine..."
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Recipe Image</label>
              
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg mb-2"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-2 rounded-full"
                  >
                    <X size={20} />
                  </button>
                  {!recipeImage && (
                    <button
                      onClick={handleUploadImage}
                      disabled={isUploadingImage}
                      className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      {isUploadingImage ? "Uploading..." : "Upload Image"}
                    </button>
                  )}
                  {recipeImage && (
                    <p className="text-green-400 text-sm mt-2">✓ Image uploaded successfully</p>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors">
                  <Upload size={40} className="text-gray-400 mb-2" />
                  <span className="text-gray-400">Click to select image</span>
                  <span className="text-gray-500 text-sm">Max 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ingredients *</label>
              <input
                type="text"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Separate ingredients with commas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Steps *</label>
              <textarea
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 h-40"
                placeholder="Enter each step on a new line..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitRecipe}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddRecipePage;