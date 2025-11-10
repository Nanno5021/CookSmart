using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/reviews/course/{courseId}
        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<ReviewResponseDto>>> GetReviewsByCourse(int courseId)
        {
            var reviews = await _context.CourseReviews
                .Include(r => r.User)
                .Where(r => r.CourseId == courseId)
                .OrderByDescending(r => r.ReviewDate)
                .ToListAsync();

            var response = reviews.Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                CourseId = r.CourseId,
                UserId = r.UserId,
                Username = r.User?.Username ?? "Anonymous",
                UserProfileImage = "", // Temporarily removed until profile images are implemented
                Rating = r.Rating,
                Comment = r.Comment,
                ReviewDate = r.ReviewDate
            }).ToList();

            return Ok(response);
        }

        // POST: api/reviews
        [HttpPost]
        public async Task<ActionResult<ReviewResponseDto>> CreateReview(CreateReviewDto dto, [FromQuery] int userId)
        {
            // Check if user already reviewed this course
            var existingReview = await _context.CourseReviews
                .FirstOrDefaultAsync(r => r.CourseId == dto.CourseId && r.UserId == userId);

            if (existingReview != null)
            {
                return BadRequest("You have already reviewed this course");
            }

            // Validate course exists
            var course = await _context.Courses.FindAsync(dto.CourseId);
            if (course == null)
            {
                return NotFound("Course not found");
            }

            // Validate user exists
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var review = new CourseReview
            {
                CourseId = dto.CourseId,
                UserId = userId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                ReviewDate = DateTime.UtcNow
            };

            _context.CourseReviews.Add(review);
            await _context.SaveChangesAsync();

            var response = new ReviewResponseDto
            {
                Id = review.Id,
                CourseId = review.CourseId,
                UserId = review.UserId,
                Username = user.Username,
                UserProfileImage = "", // Temporarily removed until profile images are implemented
                Rating = review.Rating,
                Comment = review.Comment,
                ReviewDate = review.ReviewDate
            };

            return CreatedAtAction(nameof(GetReviewsByCourse), new { courseId = review.CourseId }, response);
        }

        // DELETE: api/reviews/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id, [FromQuery] int userId)
        {
            var review = await _context.CourseReviews.FindAsync(id);
            
            if (review == null)
            {
                return NotFound();
            }

            // Only allow the user who created the review to delete it
            if (review.UserId != userId)
            {
                return Forbid();
            }

            _context.CourseReviews.Remove(review);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}