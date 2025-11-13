import React, { useState, useEffect } from 'react';
import { fetchAllRecipes, deleteRecipe } from '../../api/adminRecipeApi';
import RecipeDetailsPage from './RecipeDetailsPage';
import { Eye, Trash2, Edit, Star, BookOpen, Search } from 'lucide-react';
import EditRecipePage from "./EditRecipePage";

function ManageRecipePage() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Delete Dialog
  const [deleteRecipeId, setDeleteRecipeId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter(recipe =>
        recipe.recipeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.chefName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.cuisine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecipes(filtered);
    }
  }, [searchTerm, recipes]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllRecipes();
      setRecipes(data);
      setFilteredRecipes(data);
    } catch (err) {
      setError(err.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE RECIPE ---
  const openDeleteDialog = (id) => {
    setDeleteRecipeId(id);
  };

  const performDelete = async () => {
    try {
      setDeleting(true);
      await deleteRecipe(deleteRecipeId);
      setRecipes(prev => prev.filter(recipe => recipe.id !== deleteRecipeId));
      setDeleteRecipeId(null);
      alert('Recipe deleted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to delete recipe');
    } finally {
      setDeleting(false);
    }
  };

  // --- VIEW DETAILS ---
  const handleViewDetails = (id) => setSelectedRecipeId(id);
  
  // --- EDIT RECIPE ---
  const handleEditRecipe = (id) => setEditingRecipeId(id);

  const handleBackToList = () => {
    setSelectedRecipeId(null);
    setEditingRecipeId(null);
    loadRecipes();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Show details or edit page
  if (selectedRecipeId || editingRecipeId) {
    if (editingRecipeId) {
      return <EditRecipePage recipeId={editingRecipeId} onBack={handleBackToList} onSave={loadRecipes} />;
    }
    if (selectedRecipeId) {
      return (
        <RecipeDetailsPage
          recipeId={selectedRecipeId}
          onBack={handleBackToList}
          onEdit={setEditingRecipeId}
        />
      );
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={loadRecipes} />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Manage Recipes</h2>
        <div className="relative w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by recipe, chef, cuisine, or ingredients..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition"
          />
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          {searchTerm ? (
            <div>
              <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-2">No recipes found matching "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-orange-500 hover:text-orange-400 transition"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div>
              <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No recipes found</p>
            </div>
          )}
        </div>
      ) : (
        <RecipesTable
          recipes={filteredRecipes}
          onViewDetails={handleViewDetails}
          onEditRecipe={handleEditRecipe}
          onDeleteRecipe={openDeleteDialog}
          searchTerm={searchTerm}
        />
      )}

      {/* ---------- DELETE RECIPE DIALOG ---------- */}
      {deleteRecipeId !== null && (
        <Modal onClose={() => setDeleteRecipeId(null)}>
          <h3 className="text-xl font-bold mb-4">Delete Recipe</h3>
          <p className="text-gray-400 mb-6">
            Are you sure you want to delete this recipe? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteRecipeId(null)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={performDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Yes, Delete Recipe'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8">Manage Recipes</h2>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
        <p className="text-gray-400">Loading recipes…</p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8">Manage Recipes</h2>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function RecipesTable({ recipes, onViewDetails, onEditRecipe, onDeleteRecipe, searchTerm }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      {searchTerm && (
        <div className="px-4 py-3 bg-zinc-800 border-b border-zinc-700">
          <p className="text-sm text-gray-400">
            Showing {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} for "{searchTerm}"
          </p>
        </div>
      )}
      <table className="w-full">
        <thead className="bg-zinc-800">
          <tr>
            <th className="text-left p-4 font-semibold">Recipe Name</th>
            <th className="text-left p-4 font-semibold">Chef</th>
            <th className="text-left p-4 font-semibold">Cuisine</th>
            <th className="text-left p-4 font-semibold">Rating</th>
            <th className="text-left p-4 font-semibold">Reviews</th>
            <th className="text-left p-4 font-semibold">Created Date</th>
            <th className="text-center p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((recipe) => (
            <tr key={recipe.id} className="border-t border-zinc-800 hover:bg-zinc-800 transition-colors">
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  {recipe.recipeImage ? (
                    <img
                      src={recipe.recipeImage}
                      alt={recipe.recipeName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                  <span className="font-medium">{recipe.recipeName}</span>
                </div>
              </td>
              <td className="p-4 text-gray-400">{recipe.chefName}</td>
              <td className="p-4">
                <span className="px-2 py-1 bg-blue-500 bg-opacity-20 text-blue-400 rounded-full text-sm">
                  {recipe.cuisine}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-1">
                  <Star size={16} className="text-yellow-500 fill-current" />
                  <span>{recipe.averageRating?.toFixed(1) || '0.0'}</span>
                </div>
              </td>
              <td className="p-4 text-gray-400">{recipe.totalReviews || 0}</td>
              <td className="p-4 text-gray-400">
                {new Date(recipe.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => onViewDetails(recipe.id)}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition inline-flex items-center space-x-1"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => onEditRecipe(recipe.id)}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition inline-flex items-center space-x-1"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => onDeleteRecipe(recipe.id)}
                    className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition inline-flex items-center space-x-1"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 max-w-lg w-full p-6">
        {children}
      </div>
    </div>
  );
}

export default ManageRecipePage;