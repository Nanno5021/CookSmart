namespace Server.Models
{
    public class Post
    {
        public int id { get; set; }
        public string title { get; set; } = "";
        public string content { get; set; } = "";
        public string username { get; set; } = "";
        public DateTime createdAt { get; set; }
    }
}
