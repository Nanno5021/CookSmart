import React, { useState } from "react";
import Navbar from "../components/Navbar";
import picture from "../assets/pfp.png"; // temporary placeholder
import ratingIcon from "../assets/rating.png";
import commentIcon from "../assets/comment.png";
import viewsIcon from "../assets/views.png";
import postIcon from "../assets/post.png";

function MainPage() {
  const [sortOption, setSortOption] = useState("Popular");
  const [newPost, setNewPost] = useState("");

  const posts = [
    {
      id: 1,
      username: "ChefLiam",
      time: "2 hours ago",
      content:
        "Just tried a new pasta recipe with creamy mushroom sauce — super easy to make and tastes incredible!",
      views: 124,
      comments: 12,
      rating: 5,
    },
    {
      id: 2,
      username: "FoodieJane",
      time: "5 hours ago",
      content:
        "Experimented with homemade sushi rolls today. It’s surprisingly relaxing to prepare!",
      views: 98,
      comments: 6,
      rating: 4,
    },
    {
      id: 3,
      username: "HomeCookBen",
      time: "8 hours ago",
      content:
        "Here’s my go-to comfort dish: stir-fried noodles with garlic butter shrimp. Perfect after a long day!",
      views: 215,
      comments: 9,
      rating: 5,
    },
    {
      id: 4,
      username: "HomeCookBen",
      time: "8 hours ago",
      content:
        "Here’s my go-to comfort dish: stir-fried noodles with garlic butter shrimp. Perfect after a long day!",
      views: 215,
      comments: 9,
      rating: 5,
    },
    {
      id: 5,
      username: "HomeCookBen",
      time: "8 hours ago",
      content:
        "Here’s my go-to comfort dish: stir-fried noodles with garlic butter shrimp. Perfect after a long day!",
      views: 215,
      comments: 9,
      rating: 5,
    },
  ];

  const handleRate = (id) => {
    console.log(`Rated post ${id}`);
  };

  const handleComment = (id) => {
    console.log(`Commented on post ${id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white pl-24 flex justify-center relative">
      <Navbar />

      {/* Main Content Panel */}
      <div
        className="w-full max-w-2xl mt-10 p-6 rounded-2xl shadow-lg"
        style={{ backgroundColor: "#181818" }}
      >
        {/* Dropdown and New Post Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Main Feed</h2>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none"
          >
            <option value="Popular">Popular</option>
            <option value="Recent">Recent</option>
          </select>
        </div>

        {/* New Post Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4 w-full">
            <img
              src={picture}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            <input
              type="text"
              placeholder="New Blog Post?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full bg-transparent border-b border-gray-600 text-gray-300 focus:outline-none focus:border-white pb-1"
            />
          </div>
          <button className="bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition ml-4">
            Post
          </button>
        </div>

        {/* Divider */}
        <hr className="border-gray-700 mb-6" />

        {/* Blog Posts */}
        <div className="space-y-8">
          {posts.map((post, index) => (
            <React.Fragment key={post.id}>
              <div className="w-full max-w-2xl mt-10 p-6" style={{ backgroundColor: "#181818" }}>
                {/* Header */}
                <div className="flex items-center mb-3">
                  <img
                    src={picture}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h3 className="font-semibold text-white">{post.username}</h3>
                    <p className="text-sm text-gray-400">{post.time}</p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-gray-200 mb-4">{post.content}</p>

                {/* Buttons */}
                <div className="flex items-center justify-between text-gray-400 text-sm">
                  <div className="flex space-x-6 items-center">
                    {/* Rating Button */}
                    <button
                      onClick={() => handleRate(post.id)}
                      className="flex items-center space-x-1 hover:text-white transition"
                    >
                      <img
                        src={ratingIcon}
                        alt="Rating"
                        className="w-5 h-5 invert"
                      />
                      <span>{post.rating}</span>
                    </button>

                    {/* Comment Button */}
                    <button
                      onClick={() => handleComment(post.id)}
                      className="flex items-center space-x-1 hover:text-white transition"
                    >
                      <img
                        src={commentIcon}
                        alt="Comment"
                        className="w-5 h-5 invert"
                      />
                      <span>{post.comments}</span>
                    </button>

                    {/* Views */}
                    <div className="flex items-center space-x-1">
                      <img
                        src={viewsIcon}
                        alt="Views"
                        className="w-5 h-5 invert"
                      />
                      <span>{post.views}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line between posts */}
              {index < posts.length - 1 && (
                <hr
                  className="border-t"
                  style={{
                    borderColor: "#2a2a2a",
                    marginTop: "2rem",
                    marginBottom: "2rem",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Floating Post Button */}
      <button
        className="fixed bottom-10 right-10 bg-white rounded-full p-4 shadow-lg hover:scale-105 transition"
        title="New Post"
      >
        <img src={postIcon} alt="Post" className="w-8 h-8" />
      </button>
    </div>
  );
}

export default MainPage;
