namespace Server.Models
{
    public class User
    {
        public int id { get; set; }  
        public required string fullName { get; set; }
        public required string username { get; set; }
        public required string email { get; set; }
        public required string phone { get; set; }
        public required string password { get; set; } 
        public string role { get; set; } = "User";
        public bool isBanned { get; set; } = false;
        public DateTime joinDate { get; set; } = DateTime.Now;

        // New: avatar URL (publicly accessible)
        public string avatarUrl { get; set; } = string.Empty;

        public List<Post> Posts { get; set; } = new();
    }
}