namespace Server.Models
{
    public class User
    {
        public int id { get; set; }  
        public string fullName { get; set; }
        public string username { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public string password { get; set; } 
        public string role { get; set; } = "User";

        // New: avatar URL (publicly accessible)
        public string avatarUrl { get; set; } = string.Empty;

        public List<Post> Posts { get; set; } = new();
    }
}
