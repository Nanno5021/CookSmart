namespace Server.DTO
{
    public class ChefApplicationDTO
    {
        public int id { get; set; }
        public int userId { get; set; }

        public string fullName { get; set; }
        public string email { get; set; }

        public string specialtyCuisine { get; set; }
        public int yearsOfExperience { get; set; }
        public string certificationName { get; set; }
        public string certificationImageUrl { get; set; } 
        public string portfolioLink { get; set; }
        public string biography { get; set; }

        public string status { get; set; }
        public DateTime dateApplied { get; set; }
        public DateTime? dateReviewed { get; set; }
        public string adminRemarks { get; set; }
    }
}