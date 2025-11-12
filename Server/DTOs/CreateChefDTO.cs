namespace Server.DTO
{
    public class CreateChefDTO
    {
        public string specialtyCuisine { get; set; }
        public int yearsOfExperience { get; set; }
        public string certificationName { get; set; }
        public string certificationImageUrl { get; set; }
        public string portfolioLink { get; set; }
        public string biography { get; set; }
    }
}