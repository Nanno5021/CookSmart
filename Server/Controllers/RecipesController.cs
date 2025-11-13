using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecipesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        public RecipesController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/recipes
        // GET: api/recipes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecipeResponseDto>>> GetAllRecipes(
            [FromQuery] string? cuisine = null,
            [FromQuery] string? ingredient = null)
        {
            var query = _context.Recipes
                .Include(r => r.reviews)
                .AsQueryable();

            // Filter by cuisine
            if (!string.IsNullOrEmpty(cuisine) && cuisine != "All")
            {
                query = query.Where(r => r.cuisine.ToLower() == cuisine.ToLower());
            }

            // Filter by ingredient (search)
            if (!string.IsNullOrEmpty(ingredient))
            {
                query = query.Where(r => r.ingredients.ToLower().Contains(ingredient.ToLower()));
            }

            var recipes = await query.ToListAsync();

            // Get all chef IDs and their corresponding user details
            var chefIds = recipes.Select(r => r.chefId).Distinct().ToList();
            var chefsWithUsers = await _context.Chefs
                .Where(c => chefIds.Contains(c.id))
                .Join(_context.Users,
                    chef => chef.userId,
                    user => user.id,
                    (chef, user) => new { ChefId = chef.id, UserName = user.username })
                .ToDictionaryAsync(x => x.ChefId, x => x.UserName);

            var response = recipes.Select(r => new RecipeResponseDto
            {
                id = r.id,
                chefId = r.chefId,
                chefName = chefsWithUsers.GetValueOrDefault(r.chefId) ?? "Unknown",
                recipeName = r.recipeName,
                cuisine = r.cuisine,
                recipeImage = r.recipeImage,
                ingredients = r.ingredients.Split(',').Select(i => i.Trim()).ToList(),
                steps = r.steps.Split('\n').Select(s => s.Trim()).Where(s => !string.IsNullOrEmpty(s)).ToList(),
                createdAt = r.createdAt,
                averageRating = r.reviews.Any() ? r.reviews.Average(rv => rv.rating) : 0,
                totalReviews = r.reviews.Count
            }).ToList();

            return Ok(response);
        }
        // GET: api/recipes/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<RecipeResponseDto>> GetRecipe(int id)
        {
            var recipe = await _context.Recipes
                .Include(r => r.chef)
                .Include(r => r.reviews)
                .FirstOrDefaultAsync(r => r.id == id);

            if (recipe == null)
            {
                return NotFound();
            }

            var response = new RecipeResponseDto
            {
                id = recipe.id,
                chefId = recipe.chefId,
                chefName = recipe.chef?.username ?? "Unknown",
                recipeName = recipe.recipeName,
                cuisine = recipe.cuisine,
                recipeImage = recipe.recipeImage,
                ingredients = recipe.ingredients.Split(',').Select(i => i.Trim()).ToList(),
                steps = recipe.steps.Split('\n').Select(s => s.Trim()).Where(s => !string.IsNullOrEmpty(s)).ToList(),
                createdAt = recipe.createdAt,
                averageRating = recipe.reviews.Any() ? recipe.reviews.Average(r => r.rating) : 0,
                totalReviews = recipe.reviews.Count
            };

            return Ok(response);
        }

        // GET: api/recipes/chef/{chefId}
        [HttpGet("chef/{chefId}")]
        public async Task<ActionResult<IEnumerable<RecipeResponseDto>>> GetRecipesByChef(int chefId)
        {
            var recipes = await _context.Recipes
                .Include(r => r.chef)
                .Include(r => r.reviews)
                .Where(r => r.chefId == chefId)
                .ToListAsync();

            var response = recipes.Select(r => new RecipeResponseDto
            {
                id = r.id,
                chefId = r.chefId,
                chefName = r.chef?.username ?? "Unknown",
                recipeName = r.recipeName,
                cuisine = r.cuisine,
                recipeImage = r.recipeImage,
                ingredients = r.ingredients.Split(',').Select(i => i.Trim()).ToList(),
                steps = r.steps.Split('\n').Select(s => s.Trim()).Where(s => !string.IsNullOrEmpty(s)).ToList(),
                createdAt = r.createdAt,
                averageRating = r.reviews.Any() ? r.reviews.Average(rv => rv.rating) : 0,
                totalReviews = r.reviews.Count
            }).ToList();

            return Ok(response);
        }


        // POST: api/recipes
        [HttpPost]
        public async Task<ActionResult<RecipeResponseDto>> CreateRecipe(CreateRecipeDto dto)
        {
            // Get chefId from the DTO
            if (dto.chefId <= 0)
            {
                return BadRequest("Invalid chef ID");
            }

            // ✅ SIMPLIFIED: Just check if chef exists without including user
            var chefExists = await _context.Chefs.AnyAsync(c => c.id == dto.chefId);
            
            if (!chefExists)
            {
                return BadRequest("Chef not found");
            }

            var recipe = new Recipe
            {
                chefId = dto.chefId, // ✅ Use the chefId from DTO
                recipeName = dto.recipeName,
                cuisine = dto.cuisine,
                recipeImage = dto.recipeImage,
                ingredients = dto.ingredients,
                steps = dto.steps,
                createdAt = DateTime.UtcNow
            };

            _context.Recipes.Add(recipe);
            await _context.SaveChangesAsync();

            return await GetRecipe(recipe.id);
        }
        // PUT: api/recipes/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRecipe(int id, CreateRecipeDto dto)
        {
            var recipe = await _context.Recipes.FindAsync(id);

            if (recipe == null)
            {
                return NotFound();
            }

            recipe.recipeName = dto.recipeName;
            recipe.cuisine = dto.cuisine;
            recipe.recipeImage = dto.recipeImage;
            recipe.ingredients = dto.ingredients;
            recipe.steps = dto.steps;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/recipes/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecipe(int id)
        {
            var recipe = await _context.Recipes.FindAsync(id);
            if (recipe == null)
            {
                return NotFound();
            }

            _context.Recipes.Remove(recipe);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/recipes/upload-image
        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadRecipeImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            if (!file.ContentType.StartsWith("image/"))
                return BadRequest(new { message = "Only image files are allowed." });

            const long maxBytes = 5 * 1024 * 1024; // 5 MB
            if (file.Length > maxBytes)
                return BadRequest(new { message = "File too large. Max 5 MB." });

            // Save directly to wwwroot/recipes
            var uploadsDir = Path.Combine(
                _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), 
                "recipes"
            );
            
            if (!Directory.Exists(uploadsDir))
                Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var publicUrl = $"{Request.Scheme}://{Request.Host}/recipes/{fileName}";

            return Ok(new { imageUrl = publicUrl });
        }
    }
}