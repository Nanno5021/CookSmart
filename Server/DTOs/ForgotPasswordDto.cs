namespace Server.DTOs
{
    public class ForgotPasswordDto
    {
        public required string Email { get; set; }
    }

    public class VerifyOtpDto
    {
        public required string Email { get; set; }
        public required string Otp { get; set; }
    }

    public class ResetPasswordDto
    {
        public required string Email { get; set; }
        public required string Otp { get; set; }
        public required string NewPassword { get; set; }
    }
}

namespace Server.Models 
{
    public class OtpVerification
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public required string OtpHash { get; set; }  // Add required
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; }
        public int Attempts { get; set; } = 0;
        public DateTime CreatedAt { get; set; }
    }
}