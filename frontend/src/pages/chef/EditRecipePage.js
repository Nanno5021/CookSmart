import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";

function EditRecipePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { recipe } = location.state || {};

  useEffect(() => {
    if (!recipe) navigate("/chefrecipe");
  }, [recipe, navigate]);

  const [recipeName, setRecipeName] = useState(recipe?.name || "");
  const [recipeImage, setRecipeImage] = useState(recipe?.image || "");
  const [ingredients, setIngredients] = useState(recipe?.ingredients?.join(", ") || "");
  const [steps, setSteps] = useState(recipe?.steps?.join("\n") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateRecipe = () => {
    if (!recipeName || !ingredients || !steps.trim()) {
      alert("Please fill in recipe name, ingredients, and steps");
      return;
    }

    setIsSubmitting(true);

    const updatedRecipe = {
      ...recipe,
      name: recipeName,
      image: recipeImage,
      ingredients: ingredients.split(",").map((i) => i.trim()),
      steps: steps.split("\n").map((s) => s.trim()).filter((s) => s),
    };

    console.log("Recipe updated:", updatedRecipe);
    alert("Recipe updated successfully!");
    setIsSubmitting(false);
    navigate("/chefrecipe");
  };

  return (
    <div className="min-h-screen bg-black text-white pl-24">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Edit Recipe</h1>

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
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Recipe Image URL</label>
              <input
                type="text"
                value={recipeImage}
                onChange={(e) => setRecipeImage(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ingredients *</label>
              <input
                type="text"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Steps *</label>
              <textarea
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 h-40"
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
            onClick={handleUpdateRecipe}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditRecipePage;
