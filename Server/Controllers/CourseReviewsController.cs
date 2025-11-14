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
        public async Task<ActionResult<IEnumerable<CourseReviewResponseDto>>> GetReviewsByCourse(int courseId)
        {
            var reviews = await _context.CourseReviews
                .Include(r => r.user)
                .Where(r => r.courseId == courseId)
                .OrderByDescending(r => r.reviewDate)
                .ToListAsync();

            var response = reviews.Select(r => new CourseReviewResponseDto
            {
                id = r.id,
                courseId = r.courseId,
                userId = r.userId,
                username = r.user?.username ?? "Anonymous",
                userProfileImage = r.user?.avatarUrl ?? "", // Replace ProfilePicture with your actual field name
                rating = r.rating,
                comment = r.comment,
                reviewDate = r.reviewDate
            }).ToList();

            return Ok(response);
        }

        // POST: api/reviews
        [HttpPost]
        public async Task<ActionResult<CourseReviewResponseDto>> CreateReview(CreateCourseReviewDto dto, [FromQuery] int userId)
        {
            // Check if user already reviewed this course
            var existingReview = await _context.CourseReviews
                .FirstOrDefaultAsync(r => r.courseId == dto.courseId && r.userId == userId);

            if (existingReview != null)
            {
                return BadRequest("You have already reviewed this course");
            }

            // Validate course exists
            var course = await _context.Courses.FindAsync(dto.courseId);
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
                courseId = dto.courseId,
                userId = userId,
                rating = dto.rating,
                comment = dto.comment,
                reviewDate = DateTime.UtcNow
            };

            _context.CourseReviews.Add(review);
            await _context.SaveChangesAsync();

            var response = new CourseReviewResponseDto
            {
                id = review.id,
                courseId = review.courseId,
                userId = review.userId,
                username = user.username,
                userProfileImage = user.avatarUrl ?? "", // Replace ProfilePicture with your actual field name
                rating = review.rating,
                comment = review.comment,
                reviewDate = review.reviewDate
            };


            return CreatedAtAction(nameof(GetReviewsByCourse), new { courseId = review.courseId }, response);
        }

        // PUT: api/reviews/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<CourseReviewResponseDto>> UpdateReview(int id, UpdateCourseReviewDto dto, [FromQuery] int userId)
        {
            var review = await _context.CourseReviews
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

            var response = new CourseReviewResponseDto
            {
                id = review.id,
                courseId = review.courseId,
                userId = review.userId,
                username = review.user?.username ?? "Anonymous",
                userProfileImage = review.user?.avatarUrl ?? "", // Replace ProfilePicture with your actual field name
                rating = review.rating,
                comment = review.comment,
                reviewDate = review.reviewDate
            };

            return Ok(response);
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
            if (review.userId != userId)
            {
                return Forbid();
            }

            _context.CourseReviews.Remove(review);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}