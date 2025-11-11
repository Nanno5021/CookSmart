import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { fetchRecipeById, updateRecipe } from "../../api/recipeApi";

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

function EditRecipePage() {
  const navigate = useNavigate();
  const { recipeId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [recipeName, setRecipeName] = useState("");
  const [recipeImage, setRecipeImage] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [customCuisine, setCustomCuisine] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Load existing recipe data
  useEffect(() => {
    const loadRecipeData = async () => {
      if (!recipeId) {
        console.error("No recipeId in params");
        return;
      }

      try {
        setLoading(true);
        console.log("Loading recipe with ID:", recipeId);
        const data = await fetchRecipeById(recipeId);
        
        // Populate form with existing data
        setRecipeName(data.recipeName);
        setRecipeImage(data.recipeImage || "");
        
        // Check if cuisine is in preset list or custom
        const existingCuisine = data.cuisine || "";
        if (CUISINE_TYPES.includes(existingCuisine)) {
          setCuisine(existingCuisine);
        } else {
          setCuisine("Other");
          setCustomCuisine(existingCuisine);
        }
        
        // Convert ingredients array to comma-separated string
        setIngredients(data.ingredients?.join(", ") || "");
        
        // Convert steps array to newline-separated string
        setSteps(data.steps?.join("\n") || "");
        
      } catch (error) {
        console.error("Error loading recipe:", error);
        alert("Failed to load recipe data");
        navigate("/chefrecipe");
      } finally {
        setLoading(false);
      }
    };

    loadRecipeData();
  }, [recipeId, navigate]);

  const handleUpdateRecipe = async () => {
    const finalCuisine = getFinalCuisine();
    
    if (!recipeName || !ingredients || !steps.trim() || !finalCuisine) {
      alert("Please fill in recipe name, cuisine, ingredients, and steps");
      return;
    }

    setIsSubmitting(true);

    const updatedRecipe = {
      recipeName,
      recipeImage,
      cuisine: finalCuisine,
      ingredients: ingredients.split(",").map((i) => i.trim()).join(","),
      steps: steps.split("\n").map((s) => s.trim()).filter((s) => s).join("\n"),
    };

    try {
      await updateRecipe(recipeId, updatedRecipe);
      alert("Recipe updated successfully!");
      navigate("/chefrecipe");
    } catch (error) {
      console.error("Error updating recipe:", error);
      alert(`Failed to update recipe: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 m-0 p-0" style={{ overflowX: "hidden" }}>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl text-gray-400">Loading recipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pl-24 m-0 p-0" style={{ overflowX: "hidden" }}>
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
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 h-24"
                placeholder="Enter ingredients separated by commas (e.g., 2 eggs, 100g pasta, 50g cheese)"
              />
              <p className="text-xs text-gray-400 mt-1">Separate ingredients with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Steps *</label>
              <textarea
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 h-40"
                placeholder="Enter each step on a new line&#10;Step 1: Boil water&#10;Step 2: Cook pasta&#10;Step 3: Mix ingredients"
              />
              <p className="text-xs text-gray-400 mt-1">Enter each step on a new line</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate("/chefrecipe")}
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