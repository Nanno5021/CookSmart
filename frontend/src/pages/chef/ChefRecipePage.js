import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { fetchRecipesByChef, deleteRecipe } from "../../api/recipeApi";

function ChefRecipePage() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  
  // Replace with actual logged-in chef ID
  const chefId = 2;

  useEffect(() => {
    const getChefRecipes = async () => {
      try {
        const data = await fetchRecipesByChef(chefId);
        setRecipes(data);
      } catch (error) {
        console.error("Error fetching chef recipes:", error);
      }
    };
    getChefRecipes();
  }, [chefId]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        await deleteRecipe(id);
        setRecipes(recipes.filter((r) => r.id !== id));
      } catch (error) {
        console.error("Error deleting recipe:", error);
      }
    }
  };

  const handleEdit = (recipe) => {
    navigate(`/editrecipe/${recipe.id}`);
  };

  const handleAdd = () => {
    navigate("/addrecipe");
  };

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

        {recipes.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            You don't have any recipes yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="rounded-xl overflow-hidden shadow-md transition transform hover:scale-105 hover:shadow-lg"
                style={{ backgroundColor: "#1f1f1f" }}
              >
                <img
                  src={recipe.recipeImage}
                  alt={recipe.recipeName}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{recipe.recipeName}</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Cuisine: {recipe.cuisine}
                  </p>
                  <p className="text-gray-400 text-sm mb-3">
                    Ingredients:{" "}
                    <span className="text-gray-300">
                      {recipe.ingredients.join(", ")}
                    </span>
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(recipe)}
                      className="flex-1 text-sm font-semibold bg-yellow-500 text-black px-3 py-1 rounded-lg hover:bg-yellow-400 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="flex-1 text-sm font-semibold bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-500 transition"
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
