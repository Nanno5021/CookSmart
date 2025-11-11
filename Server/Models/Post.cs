public class Post
{
    public int id { get; set; }
    public int userId { get; set; }
    public string title { get; set; } = "";
    public string content { get; set; } = "";
    public string username { get; set; } = "";
    public DateTime createdAt { get; set; }

    // Optional new fields
    public int rating { get; set; } = 0;
    public int comments { get; set; } = 0;
    public int views { get; set; } = 0;
}
