import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { fetchRecipesByChef, deleteRecipe } from "../../api/recipeApi";

function ChefRecipePage() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get logged-in chef ID from localStorage
  const chefId = parseInt(localStorage.getItem("chefId"));

  useEffect(() => {
    const getChefRecipes = async () => {
      if (!chefId) {
        setError("No chef ID found. User may not be a chef.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchRecipesByChef(chefId);
        
        // Transform API data to ensure consistent structure
        const transformedRecipes = data.map(recipe => ({
          id: recipe.id,
          recipeName: recipe.recipeName,
          recipeImage: recipe.recipeImage,
          cuisine: recipe.cuisine,
          ingredients: Array.isArray(recipe.ingredients) 
            ? recipe.ingredients 
            : (recipe.ingredients || "").split(',').map(i => i.trim()).filter(i => i),
          steps: recipe.steps || [],
          averageRating: recipe.averageRating || 0,
          totalReviews: recipe.totalReviews || 0,
          chefName: recipe.chefName || "You"
        }));
        
        setRecipes(transformedRecipes);
        setError(null);
      } catch (error) {
        console.error("Error fetching chef recipes:", error);
        setError("Failed to load your recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    getChefRecipes();
  }, [chefId]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        await deleteRecipe(id);
        setRecipes(recipes.filter((r) => r.id !== id));
        alert("Recipe deleted successfully!");
      } catch (error) {
        console.error("Error deleting recipe:", error);
        alert("Failed to delete recipe. Please try again.");
      }
    }
  };

  const handleEdit = (recipe) => {
    navigate(`/editrecipe/${recipe.id}`, { state: { recipe } });
  };

  const handleAdd = () => {
    navigate("/addrecipe");
  };

  // Check if user is a chef
  if (!chefId) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 flex justify-center items-center">
        <Navbar />
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">You need to be a chef to access this page.</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 flex justify-center items-center">
        <Navbar />
        <div className="text-center">
          <p className="text-xl text-gray-400">Loading your recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pl-24 flex justify-center relative">
      <Navbar />

      <div className="w-full max-w-5xl mt-10 p-6 rounded-2xl shadow-lg bg-[#181818]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Recipes</h1>
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold"
          >
            Add Recipe
          </button>
        </div>

        {error && (
          <div className="bg-red-900 text-white p-4 rounded-lg mb-4">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {recipes.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-gray-500 mb-6">
              You don't have any recipes yet.
            </p>
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
            >
              Create Your First Recipe
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="rounded-xl overflow-hidden shadow-md transition transform hover:scale-105 hover:shadow-lg"
                style={{ backgroundColor: "#1f1f1f" }}
              >
                <img
                  src={recipe.recipeImage || "/api/placeholder/300/200"}
                  alt={recipe.recipeName}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/300/200";
                  }}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{recipe.recipeName}</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Cuisine: {recipe.cuisine}
                  </p>
                  <p className="text-gray-400 text-sm mb-3">
                    Ingredients:{" "}
                    <span className="text-gray-300">
                      {recipe.ingredients.slice(0, 3).join(", ")}
                      {recipe.ingredients.length > 3 ? "..." : ""}
                    </span>
                  </p>

                  {/* Rating display */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-yellow-400">
                      {"★".repeat(Math.round(recipe.averageRating))}
                      {"☆".repeat(5 - Math.round(recipe.averageRating))}
                    </span>
                    <span className="text-gray-400 text-sm">
                      ({recipe.averageRating.toFixed(1)})
                    </span>
                    <span className="text-gray-500 text-sm">
                      • {recipe.totalReviews} reviews
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(recipe)}
                      className="flex-1 text-sm font-semibold bg-yellow-500 text-black px-3 py-2 rounded-lg hover:bg-yellow-400 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="flex-1 text-sm font-semibold bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-500 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChefRecipePage;