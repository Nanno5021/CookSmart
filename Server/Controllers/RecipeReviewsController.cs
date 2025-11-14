using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecipeReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RecipeReviewsController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET: api/recipereviews/recipe/{recipeId}
        [HttpGet("recipe/{recipeId}")]
        public async Task<ActionResult<IEnumerable<RecipeReviewResponseDto>>> GetReviewsByRecipe(int recipeId)
        {
            var reviews = await _context.RecipeReviews
                .Include(r => r.user)
                .Where(r => r.recipeId == recipeId)
                .OrderByDescending(r => r.reviewDate)
                .ToListAsync();

            var response = reviews.Select(r => new RecipeReviewResponseDto
            {
                id = r.id,
                recipeId = r.recipeId,
                userId = r.userId,
                username = r.user?.username ?? "Anonymous",
                userProfileImage = r.user?.avatarUrl ?? "", // Replace ProfilePicture with your actual field name
                rating = r.rating,
                comment = r.comment,
                reviewDate = r.reviewDate
            }).ToList();

            return Ok(response);
        }

        // ✅ POST: api/recipereviews
        [HttpPost]
        public async Task<ActionResult<RecipeReviewResponseDto>> CreateReview(CreateRecipeReviewDto dto, [FromQuery] int userId)
        {
            // Check if user already reviewed this recipe
            var existingReview = await _context.RecipeReviews
                .FirstOrDefaultAsync(r => r.recipeId == dto.recipeId && r.userId == userId);

            if (existingReview != null)
            {
                return BadRequest("You have already reviewed this recipe.");
            }

            // Validate recipe exists
            var recipe = await _context.Recipes.FindAsync(dto.recipeId);
            if (recipe == null)
            {
                return NotFound("Recipe not found.");
            }

            // Validate user exists
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var review = new RecipeReview
            {
                recipeId = dto.recipeId,
                userId = userId,
                rating = dto.rating,
                comment = dto.comment,
                reviewDate = DateTime.UtcNow
            };

            _context.RecipeReviews.Add(review);
            await _context.SaveChangesAsync();

            var response = new RecipeReviewResponseDto
            {
                id = review.id,
                recipeId = review.recipeId,
                userId = review.userId,
                username = user.username,
                userProfileImage = user.avatarUrl ?? "", // Replace ProfilePicture with your actual field name
                rating = review.rating,
                comment = review.comment,
                reviewDate = review.reviewDate
            };

            return CreatedAtAction(nameof(GetReviewsByRecipe), new { recipeId = review.recipeId }, response);
        }

        // ✅ PUT: api/recipereviews/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<RecipeReviewResponseDto>> UpdateReview(int id, UpdateRecipeReviewDto dto, [FromQuery] int userId)
        {
            var review = await _context.RecipeReviews
                .Include(r => r.user)
                .FirstOrDefaultAsync(r => r.id == id);

            if (review == null)
            {
                return NotFound();
            }

            // Only allow the user who created the review to update it
            if (review.userId != userId)
            {
                return Forbid();
            }

            review.rating = dto.rating;
            review.comment = dto.comment;
            review.reviewDate = DateTime.UtcNow; // Update the review date

            await _context.SaveChangesAsync();

            var response = new RecipeReviewResponseDto
            {
                id = review.id,
                recipeId = review.recipeId,
                userId = review.userId,
                username = review.user?.username ?? "Anonymous",
                userProfileImage = review.user?.avatarUrl ?? "", // Replace ProfilePicture with your actual field name
                rating = review.rating,
                comment = review.comment,
                reviewDate = review.reviewDate
            };

            return Ok(response);
        }

        // ✅ DELETE: api/recipereviews/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id, [FromQuery] int userId)
        {
            var review = await _context.RecipeReviews.FindAsync(id);

            if (review == null)
            {
                return NotFound();
            }

            // Only allow the user who created the review to delete it
            if (review.userId != userId)
            {
                return Forbid();
            }

            _context.RecipeReviews.Remove(review);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}