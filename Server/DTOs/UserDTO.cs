namespace Server.DTO
{
    public class UserDTO
    {
        public int id { get; set; }  
        public string fullName { get; set; }
        public string email { get; set; }
        public string role { get; set; }
        public bool isBanned { get; set; }
        public DateTime joinDate { get; set; }
    }
}
