using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Server.Data;
using Server.Models;
using Server.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography; // Add this for HMACSHA256
using System.Net.Mail; // Add this for MailMessage, SmtpClient, MailAddress
using System.Net; // Add this for NetworkCredential

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }


        [HttpPost("register")]
        public IActionResult Register(RegisterDto dto)
        {
            // Check if email already exists
            if (_context.Users.Any(u => u.email == dto.email))
            {
                return BadRequest(new { message = "Email already registered." });
            }

            // Check if username already exists
            if (_context.Users.Any(u => u.username == dto.username))
            {
                return BadRequest(new { message = "Username already taken." });
            }

            // Hash the password before storing
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.password);
            var defaultAvatar = $"{Request.Scheme}://{Request.Host}/uploads/default.png"; // ensure default.png exists in wwwroot/uploads

            var user = new User
            {
                fullName = dto.fullName,
                username = dto.username,
                email = dto.email,
                phone = dto.phone,
                password = hashedPassword,
                role = dto.role ?? "User",
                avatarUrl = defaultAvatar
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "User registered successfully!" });
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Identifier) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Invalid login data." });

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.email == dto.Identifier || u.username == dto.Identifier);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.password))
                return Unauthorized(new { message = "Invalid username/email or password." });

            if (user.isBanned)
                return StatusCode(403, new { message = "Your account has been banned. Please contact support for more information." });

            var token = GenerateJwtToken(user);

            int? chefId = null;
            if (user.role.Equals("Chef", StringComparison.OrdinalIgnoreCase))
            {
                var chef = await _context.Chefs
                    .FirstOrDefaultAsync(c => c.userId == user.id);
                
                if (chef != null)
                {
                    chefId = chef.id;
                }
            }

            return Ok(new
            {
                message = "Login successful",
                token = token,
                user = new
                {
                    user.id,
                    user.username,
                    user.email,
                    user.fullName,
                    user.phone,
                    user.role,
                    user.avatarUrl,
                    chefId = chefId 
                }
            });
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.username),
                new Claim(JwtRegisteredClaimNames.Email, user.email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("userId", user.id.ToString()),
                new Claim("fullName", user.fullName ?? ""),
                new Claim("role", user.role ?? "User")
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.email == dto.Email);
            if (user == null)
            {
                // Don't reveal that the user doesn't exist
                return Ok(new { message = "If the email exists, an OTP has been sent." });
            }

            // Generate OTP
            string otp = GenerateNumericOtp();
            string secret = _config["OtpSecret"];
            string otpHash = HashOtp(otp, secret);

            // Save OTP to database (you'll need to create an OtpVerification table)
            var otpRecord = new OtpVerification
            {
                UserId = user.id,
                OtpHash = otpHash,
                ExpiresAt = DateTime.UtcNow.AddMinutes(10),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.OtpVerifications.Add(otpRecord);
            await _context.SaveChangesAsync();

            // Send OTP email
            await SendOtpEmail(user.email, otp);

            return Ok(new { message = "OTP has been sent to your email." });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
        {
            Console.WriteLine($"Verify OTP request for: {dto.Email}, OTP: {dto.Otp}");
            Console.WriteLine($"Current UTC time: {DateTime.UtcNow}");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.email == dto.Email);
            if (user == null)
            {
                Console.WriteLine("User not found");
                return BadRequest(new { message = "Invalid request." });
            }

            var otpRecord = await _context.OtpVerifications
                .Where(o => o.UserId == user.id && !o.IsUsed && o.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otpRecord == null)
            {
                Console.WriteLine("No valid OTP record found");
                return BadRequest(new { message = "OTP has expired or is invalid." });
            }

            Console.WriteLine($"Found OTP record: ID {otpRecord.Id}, Expires: {otpRecord.ExpiresAt}");

            string secret = _config["OtpSecret"] ?? "default-secret";
            string providedOtpHash = HashOtp(dto.Otp, secret);

            Console.WriteLine($"Provided OTP hash: {providedOtpHash}");
            Console.WriteLine($"Stored OTP hash: {otpRecord.OtpHash}");

            if (otpRecord.OtpHash != providedOtpHash)
            {
                Console.WriteLine("OTP hash mismatch");
                otpRecord.Attempts++;
                await _context.SaveChangesAsync();
                return BadRequest(new { message = "Invalid OTP." });
            }

            // DON'T mark as used here - only mark it when password is actually reset
            // otpRecord.IsUsed = true;
            // await _context.SaveChangesAsync();

            Console.WriteLine("OTP verified successfully (not marked as used yet)");
            return Ok(new { message = "OTP verified successfully." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            try
            {
                Console.WriteLine($"Reset password request for: {dto.Email}");
                
                var user = await _context.Users.FirstOrDefaultAsync(u => u.email == dto.Email);
                if (user == null)
                {
                    Console.WriteLine("User not found");
                    return BadRequest(new { message = "Invalid request." });
                }

                // Find the verified but not yet used OTP
                var otpRecord = await _context.OtpVerifications
                    .Where(o => o.UserId == user.id && !o.IsUsed && o.ExpiresAt > DateTime.UtcNow)
                    .OrderByDescending(o => o.CreatedAt)
                    .FirstOrDefaultAsync();

                if (otpRecord == null)
                {
                    Console.WriteLine("No valid OTP record found");
                    return BadRequest(new { message = "OTP has expired or is invalid." });
                }

                // Verify OTP one more time
                string secret = _config["OtpSecret"] ?? "default-secret";
                string providedOtpHash = HashOtp(dto.Otp, secret);

                if (otpRecord.OtpHash != providedOtpHash)
                {
                    Console.WriteLine("OTP hash mismatch");
                    otpRecord.Attempts++;
                    await _context.SaveChangesAsync();
                    return BadRequest(new { message = "Invalid OTP." });
                }

                // Update password AND mark OTP as used
                user.password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
                otpRecord.IsUsed = true;
                await _context.SaveChangesAsync();

                Console.WriteLine("Password reset successfully for user: " + user.email);
                return Ok(new { message = "Password has been reset successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in reset password: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Internal server error. Please try again." });
            }
        }

        // Helper methods
        private string GenerateNumericOtp()
        {
            Random random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        private string HashOtp(string otp, string? secret)
        {
            // Use a default secret if none is configured
            secret ??= "default-otp-secret-key-for-development";
            
            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret)))
            {
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(otp));
                return Convert.ToBase64String(hash);
            }
        }

        private async Task SendOtpEmail(string email, string otp)
        {
            try
            {
                var emailSettings = _config.GetSection("EmailSettings");
                var smtpServer = emailSettings["SmtpServer"] ?? "smtp.gmail.com";
                var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");
                var senderEmail = emailSettings["SenderEmail"];
                var senderPassword = emailSettings["SenderPassword"];
                var enableSsl = bool.Parse(emailSettings["EnableSsl"] ?? "true");

                if (string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(senderPassword))
                {
                    Console.WriteLine("Email credentials not configured. OTP: " + otp);
                    return; // Don't throw, just log and continue
                }

                using var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail),
                    Subject = "Password Reset OTP - CookSmart",
                    Body = $@"
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body {{ font-family: Arial, sans-serif; }}
                                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                                .otp-code {{ 
                                    font-size: 32px; 
                                    font-weight: bold; 
                                    color: #2563eb; 
                                    text-align: center;
                                    margin: 20px 0;
                                }}
                                .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <h2>Password Reset Request</h2>
                                <p>You requested to reset your password. Use the OTP code below:</p>
                                <div class='otp-code'>{otp}</div>
                                <p>This OTP will expire in <strong>10 minutes</strong>.</p>
                                <p>If you didn't request this, please ignore this email.</p>
                                <div class='footer'>
                                    <p>Best regards,<br>CookSmart Team</p>
                                </div>
                            </div>
                        </body>
                        </html>",
                    IsBodyHtml = true
                };

                mailMessage.To.Add(email);

                using var smtpClient = new SmtpClient(smtpServer)
                {
                    Port = smtpPort,
                    Credentials = new NetworkCredential(senderEmail, senderPassword),
                    EnableSsl = enableSsl,
                };

                await smtpClient.SendMailAsync(mailMessage);
                
                Console.WriteLine($"OTP email sent successfully to {email}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Email sending failed: {ex.Message}");
                // Log the OTP for development
                Console.WriteLine($"OTP for {email}: {otp}");
            }
        }
    }
}