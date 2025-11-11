namespace Server.DTO
{
    public class UserDetailDTO
    {
        public int id { get; set; }
        public string fullName { get; set; }
        public string username { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public string role { get; set; }
        public bool isBanned { get; set; }
        public DateTime joinDate { get; set; }
        public string avatarUrl { get; set; }
        

        // public int? totalPosts { get; set; }
        // public int? totalComments { get; set; }
        // public int? totalViews { get; set; }
        // public string bio { get; set; }
    }
}