using System.Collections.Generic;

namespace Server.DTOs
{
    public class ProfileDto
    {
        public int id { get; set; }
        public string fullName { get; set; } = string.Empty;
        public string username { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string phone { get; set; } = string.Empty;
        public string bio { get; set; } = string.Empty;
        public string avatarUrl { get; set; } = string.Empty;
        public IEnumerable<PostDto>? posts { get; set; }
    }
}
