using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.DTO;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ManageUserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ManageUserController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/ManageUser
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserDTO
                {
                    id = u.id,
                    fullName = u.fullName,
                    email = u.email,
                    role = u.role,
                    isBanned = u.isBanned,
                    joinDate = u.joinDate
                })
                .ToListAsync();

            return Ok(users);
        }

        // POST: api/ManageUser/update-role/{id}
        [HttpPost("update-role/{id}")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] string newRole)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.role = newRole;
            await _context.SaveChangesAsync();

            return Ok("User role updated.");
        }

        // POST: api/ManageUser/ban/{id}
        [HttpPost("ban/{id}")]
        public async Task<IActionResult> BanUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.isBanned = true;
            await _context.SaveChangesAsync();

            return Ok("User banned.");
        }
    }
}
