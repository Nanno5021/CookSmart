namespace Server.Models
{
    public class RegisterDto
    {
        public string fullName { get; set; }
        public string username { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public string password { get; set; }
        public string role { get; set; } 
    }
}