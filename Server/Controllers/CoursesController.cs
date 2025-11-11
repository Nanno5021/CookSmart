using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CoursesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/courses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseResponseDto>>> GetAllCourses()
        {
            var courses = await _context.Courses
                .Include(c => c.chef)
                .Include(c => c.sections)
                .Include(c => c.quizQuestions)
                .ToListAsync();

            var response = courses.Select(c => new CourseResponseDto
            {
                id = c.id,
                chefId = c.chefId,
                chefName = c.chef?.username ?? "Unknown Chef",
                chefImage = "", // Temporarily removed until profile images are implemented
                courseName = c.courseName,
                courseImage = c.courseImage,
                ingredients = c.ingredients,
                difficulty = c.difficulty,
                estimatedTime = c.estimatedTime,
                description = c.description,
                createdAt = c.createdAt,
                sections = c.sections.OrderBy(s => s.sectionOrder).Select(s => new CourseSectionResponseDto
                {
                    id = s.id,
                    sectionTitle = s.sectionTitle,
                    contentType = s.contentType,
                    content = s.content,
                    sectionOrder = s.sectionOrder
                }).ToList(),
                quizQuestions = c.quizQuestions.OrderBy(q => q.questionOrder).Select(q => new QuizQuestionResponseDto
                {
                    id = q.id,
                    question = q.question,
                    options = new List<string> { q.option1, q.option2, q.option3, q.option4 },
                    answer = q.correctAnswer,
                    questionOrder = q.questionOrder
                }).ToList()
            }).ToList();

            return Ok(response);
        }

        // GET: api/courses/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CourseResponseDto>> GetCourse(int id)
        {
            var course = await _context.Courses
                .Include(c => c.chef)
                .Include(c => c.sections)
                .Include(c => c.quizQuestions)
                .FirstOrDefaultAsync(c => c.id == id);

            if (course == null)
            {
                return NotFound();
            }

            var response = new CourseResponseDto
            {
                id = course.id,
                chefId = course.chefId,
                chefName = course.chef?.username ?? "Unknown Chef",
                chefImage = "", // Temporarily removed until profile images are implemented
                courseName = course.courseName,
                courseImage = course.courseImage,
                ingredients = course.ingredients,
                difficulty = course.difficulty,
                estimatedTime = course.estimatedTime,
                description = course.description,
                createdAt = course.createdAt,
                sections = course.sections.OrderBy(s => s.sectionOrder).Select(s => new CourseSectionResponseDto
                {
                    id = s.id,
                    sectionTitle = s.sectionTitle,
                    contentType = s.contentType,
                    content = s.content,
                    sectionOrder = s.sectionOrder
                }).ToList(),    
                quizQuestions = course.quizQuestions.OrderBy(q => q.questionOrder).Select(q => new QuizQuestionResponseDto
                {
                    id = q.id,
                    question = q.question,
                    options = new List<string> { q.option1, q.option2, q.option3, q.option4 },
                    answer = q.correctAnswer,
                    questionOrder = q.questionOrder
                }).ToList()
            };

            return Ok(response);
        }

        // GET: api/courses/chef/{chefId}
        [HttpGet("chef/{chefId}")]
        public async Task<ActionResult<IEnumerable<CourseResponseDto>>> GetCoursesByChef(int chefId)
        {
            var courses = await _context.Courses
                .Include(c => c.chef)
                .Include(c => c.sections)
                .Include(c => c.quizQuestions)
                .Where(c => c.chefId == chefId)
                .ToListAsync();

            var response = courses.Select(c => new CourseResponseDto
            {
                id = c.id,
                chefId = c.chefId,
                chefName = c.chef?.username ?? "Unknown Chef",
                chefImage = "", // Temporarily removed until profile images are implemented
                courseName = c.courseName,
                courseImage = c.courseImage,
                ingredients = c.ingredients,
                difficulty = c.difficulty,
                estimatedTime = c.estimatedTime,
                description = c.description,
                createdAt = c.createdAt,
                sections = c.sections.OrderBy(s => s.sectionOrder).Select(s => new CourseSectionResponseDto
                {
                    id = s.id,
                    sectionTitle = s.sectionTitle,
                    contentType = s.contentType,
                    content = s.content,
                    sectionOrder = s.sectionOrder
                }).ToList(),
                quizQuestions = c.quizQuestions.OrderBy(q => q.questionOrder).Select(q => new QuizQuestionResponseDto
                {
                    id = q.id,
                    question = q.question,
                    options = new List<string> { q.option1, q.option2, q.option3, q.option4 },
                    answer = q.correctAnswer,
                    questionOrder = q.questionOrder
                }).ToList()
            }).ToList();

            return Ok(response);
        }

        // POST: api/courses
        [HttpPost]
        public async Task<ActionResult<CourseResponseDto>> CreateCourse(CreateCourseDto dto)
        {
            // Temporarily skip chef validation - you can uncomment this later
            // var chef = await _context.Users.FindAsync(dto.ChefId);
            // if (chef == null)
            // {
            //     return BadRequest("Chef not found");
            // }

            var course = new Course
            {
                chefId = 1, // Use default ChefId of 1 if not provided
                courseName = dto.courseName,
                courseImage = dto.courseImage,
                ingredients = dto.ingredients,
                difficulty = dto.difficulty,
                estimatedTime = dto.estimatedTime,
                description = dto.description,
                createdAt = DateTime.UtcNow
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            // Add sections
            foreach (var sectionDto in dto.sections)
            {
                var section = new CourseSection
                {
                    courseId = course.id,
                    sectionTitle = sectionDto.sectionTitle,
                    contentType = sectionDto.contentType,
                    content = sectionDto.content,
                    sectionOrder = sectionDto.sectionOrder
                };
                _context.CourseSections.Add(section);
            }

            // Add quiz questions
            foreach (var quizDto in dto.quizQuestions)
            {
                var quiz = new QuizQuestion
                {
                    courseId = course.id,
                    question = quizDto.question,
                    option1 = quizDto.option1,
                    option2 = quizDto.option2,
                    option3 = quizDto.option3,
                    option4 = quizDto.option4,
                    correctAnswer = quizDto.correctAnswer,
                    questionOrder = quizDto.questionOrder
                };
                _context.QuizQuestions.Add(quiz);
            }

            await _context.SaveChangesAsync();

            // Return the created course
            return await GetCourse(course.id);
        }

        // PUT: api/courses/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCourse(int id, CreateCourseDto dto)
        {
            var course = await _context.Courses
                .Include(c => c.sections)
                .Include(c => c.quizQuestions)
                .FirstOrDefaultAsync(c => c.id == id);

            if (course == null)
            {
                return NotFound();
            }

            // Update course details
            course.courseName = dto.courseName;
            course.courseImage = dto.courseImage;
            course.ingredients = dto.ingredients;
            course.difficulty = dto.difficulty;
            course.estimatedTime = dto.estimatedTime;
            course.description = dto.description;

            // Remove old sections and quiz questions
            _context.CourseSections.RemoveRange(course.sections);
            _context.QuizQuestions.RemoveRange(course.quizQuestions);

            // Add new sections
            foreach (var sectionDto in dto.sections)
            {
                var section = new CourseSection
                {
                    courseId = course.id,
                    sectionTitle = sectionDto.sectionTitle,
                    contentType = sectionDto.contentType,
                    content = sectionDto.content,
                    sectionOrder = sectionDto.sectionOrder
                };
                _context.CourseSections.Add(section);
            }

            // Add new quiz questions
            foreach (var quizDto in dto.quizQuestions)
            {
                var quiz = new QuizQuestion
                {
                    courseId = course.id,
                    question = quizDto.question,
                    option1 = quizDto.option1,
                    option2 = quizDto.option2,
                    option3 = quizDto.option3,
                    option4 = quizDto.option4,
                    correctAnswer = quizDto.correctAnswer,
                    questionOrder = quizDto.questionOrder
                };
                _context.QuizQuestions.Add(quiz);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/courses/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}