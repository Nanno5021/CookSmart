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
        public ChefDTO chefProfile { get; set; }

    }
    public class ChefDTO
    {
        public int id { get; set; }
        public string specialtyCuisine { get; set; }
        public int yearsOfExperience { get; set; }
        public string certificationName { get; set; }
        public string certificationImageUrl { get; set; }
        public string portfolioLink { get; set; }
        public string biography { get; set; }
        public double rating { get; set; }
        public int totalReviews { get; set; }
        public DateTime approvedDate { get; set; }
    }
}