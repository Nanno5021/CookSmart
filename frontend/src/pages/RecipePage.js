import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import searchIcon from "../assets/search.png";
import { useNavigate } from "react-router-dom";
import { fetchAllRecipes } from "../api/recipeApi";

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

function RecipePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUserRole(localStorage.getItem("role"));
    const getRecipes = async () => {
      try {
        const data = await fetchAllRecipes();
        setRecipes(data);
        setFilteredRecipes(data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
    getRecipes();
  }, []);

  useEffect(() => {
    let results = recipes;

    if (selectedCuisine !== "All") {
      results = results.filter(
        (r) => r.cuisine.toLowerCase() === selectedCuisine.toLowerCase()
      );
    }

    if (searchTerm.trim() !== "") {
      results = results.filter((r) =>
        r.ingredients.some((i) =>
          i.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredRecipes(results);
  }, [searchTerm, selectedCuisine, recipes]);

  return (
    <div className="min-h-screen bg-black text-white pl-24 flex justify-center relative">
      <Navbar />

      <div
        className="w-full max-w-5xl mt-10 p-6 rounded-2xl shadow-lg"
        style={{ backgroundColor: "#181818" }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 w-full md:w-1/2">
            <img
              src={searchIcon}
              alt="Search"
              className="w-5 h-5 mr-2 opacity-70"
            />
            <input
              type="text"
              placeholder="Search by ingredient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-gray-300 focus:outline-none"
            />
          </div>

          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="bg-gray-800 text-white px-3 py-2 rounded-lg mt-4 md:mt-0 md:ml-4 focus:outline-none"
          >
            <option value="All">All Cuisines</option>
            {CUISINE_TYPES.map((cuisineType) => (
              <option key={cuisineType} value={cuisineType}>
                {cuisineType}
              </option>
            ))}
          </select>
        </div>

        <hr className="border-gray-700 mb-6" />

        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((recipe) => (
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
                  <h3 className="text-lg font-semibold mb-1">
                    {recipe.recipeName}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-1">
                    By: <span className="text-gray-300">{recipe.chefName}</span>
                  </p>
                  
                  <p className="text-gray-400 text-sm mb-2">
                    Cuisine: {recipe.cuisine}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400">
                      {"★".repeat(Math.round(recipe.averageRating))}
                    </span>
                    <span className="text-gray-400 text-sm">
                      ({recipe.averageRating.toFixed(1)})
                    </span>
                    <span className="text-gray-500 text-sm">
                      • {recipe.totalReviews} reviews
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-3">
                    Ingredients:{" "}
                    <span className="text-gray-300">
                      {recipe.ingredients.slice(0, 3).join(", ")}
                      {recipe.ingredients.length > 3 ? "..." : ""}
                    </span>
                  </p>

                  <div className="flex items-center justify-between text-gray-500 text-sm">
                    <button
                      onClick={() =>
                        navigate("/recipedetail", { state: { recipe } })
                      }
                      className="text-sm font-semibold bg-white text-black px-3 py-1 rounded-lg hover:bg-gray-300 transition"
                    >
                      View Recipe
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            No recipes found.
          </p>
        )}
      </div>

      {userRole !== "Admin" && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => navigate("/requestchef")}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-full shadow-lg font-semibold transition"
          >
            Request Chef Account
          </button>
        </div>
      )}
    </div>
  );
}

export default RecipePage;