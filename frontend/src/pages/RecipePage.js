import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import searchIcon from "../assets/search.png";
import recipeIcon from "../assets/recipe.png";
import { useNavigate } from "react-router-dom";

function RecipePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const navigate = useNavigate();

  // 🧑‍🍳 Mock recipe data
  const mockRecipes = [
    {
      id: 1,
      name: "Spaghetti Carbonara",
      cuisine: "Italian",
      image: "https://images.unsplash.com/photo-1603133872878-684f0b9f1f64",
      ingredients: ["Pasta", "Egg", "Bacon", "Cheese", "Pepper"],
    },
    {
      id: 2,
      name: "Chicken Fried Rice",
      cuisine: "Chinese",
      image: "https://images.unsplash.com/photo-1589308078050-972be9d7767f",
      ingredients: ["Chicken", "Rice", "Egg", "Soy Sauce", "Peas"],
    },
    {
      id: 3,
      name: "Sushi Rolls",
      cuisine: "Japanese",
      image: "https://images.unsplash.com/photo-1600628422018-90b6fbe30b2b",
      ingredients: ["Rice", "Seaweed", "Salmon", "Avocado", "Cucumber"],
    },
    {
      id: 4,
      name: "Nasi Lemak",
      cuisine: "Malaysian",
      image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0",
      ingredients: ["Rice", "Coconut Milk", "Chili", "Anchovies", "Egg"],
    },
  ];

  useEffect(() => {
    setRecipes(mockRecipes);
    setFilteredRecipes(mockRecipes);
  }, []);

  // 🔍 Filter by search term or cuisine
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

      {/* Main Content */}
      <div
        className="w-full max-w-5xl mt-10 p-6 rounded-2xl shadow-lg"
        style={{ backgroundColor: "#181818" }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          {/* Search bar */}
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

          {/* Cuisine Filter */}
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="bg-gray-800 text-white px-3 py-2 rounded-lg mt-4 md:mt-0 md:ml-4 focus:outline-none"
          >
            <option value="All">All Cuisines</option>
            <option value="Italian">Italian</option>
            <option value="Chinese">Chinese</option>
            <option value="Japanese">Japanese</option>
            <option value="Malaysian">Malaysian</option>
          </select>
        </div>

        {/* Divider */}
        <hr className="border-gray-700 mb-6" />

        {/* Recipes Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="rounded-xl overflow-hidden shadow-md transition transform hover:scale-105 hover:shadow-lg"
                style={{ backgroundColor: "#1f1f1f" }}
              >
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">
                    {recipe.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">
                    Cuisine: {recipe.cuisine}
                  </p>
                  <p className="text-gray-400 text-sm mb-3">
                    Ingredients:{" "}
                    <span className="text-gray-300">
                      {recipe.ingredients.join(", ")}
                    </span>
                  </p>

                  <div className="flex items-center justify-between text-gray-500 text-sm">
                    <button
                      onClick={() => navigate("/recipedetail", { state: { recipe } })}
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
            No recipes found for your search.
          </p>
        )}
      </div>
    </div>
  );
}

export default RecipePage;
