import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { createRecipe } from "../../api/recipeApi";

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
  const [cuisine, setCuisine] = useState("");
  const [customCuisine, setCustomCuisine] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Replace with actual logged-in chef ID
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

  const handleSubmitRecipe = async () => {
    const finalCuisine = getFinalCuisine();
    
    if (!recipeName || !ingredients || !steps.trim() || !finalCuisine) {
      alert("Please fill in recipe name, cuisine, ingredients, and steps");
      return;
    }

    setIsSubmitting(true);

    const recipeData = {
      recipeName,
      recipeImage,
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
              <label className="block text-sm font-medium mb-2">Recipe Image URL</label>
              <input
                type="text"
                value={recipeImage}
                onChange={(e) => setRecipeImage(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
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