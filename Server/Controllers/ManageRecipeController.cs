using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.DTO;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ManageRecipeController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public ManageRecipeController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/ManageRecipe
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecipeDTO>>> GetRecipes()
        {
            var recipes = await _context.Recipes
                .Include(r => r.chef)
                .Include(r => r.reviews)
                .Join(
                    _context.Chefs,
                    recipe => recipe.chefId,
                    chef => chef.id,
                    (recipe, chef) => new { recipe, chef }
                )
                .Join(
                    _context.Users,
                    rc => rc.chef.userId,
                    user => user.id,
                    (rc, user) => new RecipeDTO
                    {
                        id = rc.recipe.id,
                        chefId = rc.recipe.chefId,
                        chefName = user.fullName,
                        recipeName = rc.recipe.recipeName,
                        cuisine = rc.recipe.cuisine,
                        recipeImage = rc.recipe.recipeImage,
                        ingredients = rc.recipe.ingredients,
                        steps = rc.recipe.steps,
                        createdAt = rc.recipe.createdAt,
                        averageRating = rc.recipe.reviews.Any() ? rc.recipe.reviews.Average(rv => rv.rating) : 0.0,
                        totalReviews = rc.recipe.reviews.Count
                    }
                )
                .OrderByDescending(r => r.createdAt)
                .ToListAsync();

            return Ok(recipes);
        }

        // GET: api/ManageRecipe/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<RecipeDetailDTO>> GetRecipeById(int id)
        {
            var recipe = await _context.Recipes
                .Include(r => r.chef)
                .Include(r => r.reviews)
                    .ThenInclude(rv => rv.user)
                .Where(r => r.id == id)
                .Join(
                    _context.Chefs,
                    recipe => recipe.chefId,
                    chef => chef.id,
                    (recipe, chef) => new { recipe, chef }
                )
                .Join(
                    _context.Users,
                    rc => rc.chef.userId,
                    user => user.id,
                    (rc, user) => new RecipeDetailDTO
                    {
                        id = rc.recipe.id,
                        chefId = rc.recipe.chefId,
                        chefName = user.fullName,
                        chefAvatar = user.avatarUrl,
                        recipeName = rc.recipe.recipeName,
                        cuisine = rc.recipe.cuisine,
                        recipeImage = rc.recipe.recipeImage,
                        ingredients = rc.recipe.ingredients,
                        steps = rc.recipe.steps,
                        createdAt = rc.recipe.createdAt,
                        averageRating = rc.recipe.reviews.Any() ? rc.recipe.reviews.Average(rv => rv.rating) : 0.0,
                        totalReviews = rc.recipe.reviews.Count,
                        reviews = rc.recipe.reviews.Select(rv => new RecipeReviewDTO
                        {
                            id = rv.id,
                            userId = rv.userId,
                            userName = rv.user!.fullName,
                            userAvatar = rv.user.avatarUrl,
                            rating = rv.rating,
                            comment = rv.comment,
                            reviewDate = rv.reviewDate
                        }).OrderByDescending(rv => rv.reviewDate).ToList()
                    }
                )
                .FirstOrDefaultAsync();

            if (recipe == null)
                return NotFound(new { message = "Recipe not found" });

            return Ok(recipe);
        }

        // PUT: api/ManageRecipe/update/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateRecipe(int id, [FromBody] UpdateRecipeDTO dto)
        {
            var recipe = await _context.Recipes.FindAsync(id);
            if (recipe == null)
                return NotFound(new { message = "Recipe not found" });

            // Update fields
            if (!string.IsNullOrWhiteSpace(dto.recipeName))
                recipe.recipeName = dto.recipeName;

            if (!string.IsNullOrWhiteSpace(dto.cuisine))
                recipe.cuisine = dto.cuisine;

            if (!string.IsNullOrWhiteSpace(dto.ingredients))
                recipe.ingredients = dto.ingredients;

            if (!string.IsNullOrWhiteSpace(dto.steps))
                recipe.steps = dto.steps;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Recipe updated successfully" });
        }

        // POST: api/ManageRecipe/upload-image/{id}
        [HttpPost("upload-image/{id}")]
        public async Task<IActionResult> UploadRecipeImage(int id, [FromForm] IFormFile file)
        {
            var recipe = await _context.Recipes.FindAsync(id);
            if (recipe == null)
                return NotFound(new { message = "Recipe not found" });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Invalid file type. Only images are allowed." });

            // Validate file size (max 5MB)
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "File size exceeds 5MB limit" });

            try
            {
                // Delete old image if exists
                if (!string.IsNullOrEmpty(recipe.recipeImage))
                {
                    var oldFilePath = Path.Combine(_env.WebRootPath, recipe.recipeImage.TrimStart('/'));
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                    }
                }

                // Create recipes directory if it doesn't exist
                var recipesDir = Path.Combine(_env.WebRootPath, "recipes");
                if (!Directory.Exists(recipesDir))
                {
                    Directory.CreateDirectory(recipesDir);
                }

                // Generate unique filename
                var fileName = $"recipe_{id}_{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(recipesDir, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Update recipe image URL
                recipe.recipeImage = $"{Request.Scheme}://{Request.Host}/recipes/{fileName}";
                await _context.SaveChangesAsync();

                return Ok(new 
                { 
                    message = "Recipe image uploaded successfully",
                    recipeImage = recipe.recipeImage
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error uploading file", error = ex.Message });
            }
        }

        // DELETE: api/ManageRecipe/delete/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteRecipe(int id)
        {
            var recipe = await _context.Recipes
                .Include(r => r.reviews)
                .FirstOrDefaultAsync(r => r.id == id);

            if (recipe == null)
                return NotFound(new { message = "Recipe not found" });

            try
            {
                // Delete recipe image if exists
                if (!string.IsNullOrEmpty(recipe.recipeImage))
                {
                    var imagePath = Path.Combine(_env.WebRootPath, recipe.recipeImage.TrimStart('/'));
                    if (System.IO.File.Exists(imagePath))
                    {
                        System.IO.File.Delete(imagePath);
                    }
                }

                // Delete the recipe 
                _context.Recipes.Remove(recipe);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Recipe deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting recipe", error = ex.Message });
            }
        }

        // DELETE: api/ManageRecipe/delete-review/{id}
        [HttpDelete("delete-review/{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.RecipeReviews.FindAsync(id);
            if (review == null)
                return NotFound(new { message = "Review not found" });

            try
            {
                _context.RecipeReviews.Remove(review);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Review deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting review", error = ex.Message });
            }
        }
    }
}