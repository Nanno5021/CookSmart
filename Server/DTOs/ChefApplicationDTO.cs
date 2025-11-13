namespace Server.DTO
{
    public class ChefApplicationDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        public string FullName { get; set; }
        public string Email { get; set; }

        public string SpecialtyCuisine { get; set; }
        public int YearsOfExperience { get; set; }
        public string CertificationName { get; set; }
        public string CertificationImageUrl { get; set; } 
        public string PortfolioLink { get; set; }
        public string Biography { get; set; }

        public string Status { get; set; }
        public DateTime DateApplied { get; set; }
        public DateTime? DateReviewed { get; set; }
        public string AdminRemarks { get; set; }
    }
}