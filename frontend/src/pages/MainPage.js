import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import picture from "../assets/pfp.png";
import ratingIcon from "../assets/rating.png";
import commentIcon from "../assets/comment.png";
import viewsIcon from "../assets/views.png";
import postIcon from "../assets/post.png";
import { fetchPosts } from "../api/post"; // this is your API call

function MainPage() {
  const [sortOption, setSortOption] = useState("Popular");
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    // ⚠️ Don’t shadow the imported function name
    const loadPosts = async () => {
      try {
        const data = await fetchPosts(); // call your API directly
        setPosts(data); // your fetchPosts already returns json
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    loadPosts();
  }, []);

  const handleNewPost = () => {
    if (!isLoggedIn) {
      alert("You need to log in to create a post.");
      return;
    }
    navigate("/postblog", { state: { title: newPost } });
  };

  const handleRate = (id) => {
    if (!isLoggedIn) {
      alert("You need to log in to rate posts.");
      return;
    }
    console.log("Rated:", id);
  };

  const handleComment = (id) => {
    console.log(`Commented on post ${id}`);
  };
  

  return (
    <div className="min-h-screen bg-black text-white pl-24 flex justify-center relative">
      <Navbar />

      {/* Main Content */}
      <div
        className="w-full max-w-2xl mt-10 p-6 rounded-2xl shadow-lg"
        style={{ backgroundColor: "#181818" }}
      >
        {/* Header */}
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

        {/* New Post Input */}
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
          <button
            onClick={handleNewPost}
            className="bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition ml-4"
          >
            Post
          </button>
        </div>


        <hr className="border-gray-700 mb-6" />

        {/* Blog Posts */}
        <div className="space-y-8">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <React.Fragment key={post.id}>
                <div
                  className="w-full max-w-2xl mt-10 p-6 rounded-lg"
                  style={{ backgroundColor: "#1f1f1f" }}
                >
                  <div className="flex items-center mb-3">
                    <img
                      src={picture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <h3 className="font-semibold text-white">
                        {post.username || "Anonymous"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-200 mb-4">{post.content}</p>

                  <div className="flex items-center justify-between text-gray-400 text-sm">
                    <div className="flex space-x-6 items-center">
                      <button
                        onClick={() => handleRate(post.id)}
                        disabled={!isLoggedIn}
                        className={`flex items-center space-x-1 transition ${
                          isLoggedIn
                            ? "hover:text-white"
                            : "opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <img
                          src={ratingIcon}
                          alt="Rating"
                          className="w-5 h-5 invert"
                        />
                        <span>{post.rating || 0}</span>
                      </button>

                      <button
                        onClick={() => handleComment(post.id)}
                        className="flex items-center space-x-1 hover:text-white transition"
                      >
                        <img
                          src={commentIcon}
                          alt="Comment"
                          className="w-5 h-5 invert"
                        />
                        <span>{post.comments || 0}</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <img
                          src={viewsIcon}
                          alt="Views"
                          className="w-5 h-5 invert"
                        />
                        <span>{post.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

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
            ))
          ) : (
            <p className="text-center text-gray-500 mt-10">
              No blog posts available yet.
            </p>
          )}
        </div>
      </div>


      <button
        onClick={() =>
          isLoggedIn
            ? navigate("/postblog")
            : alert("You need to log in to create a post.")
        }
        className="fixed bottom-10 right-10 bg-white rounded-full p-4 shadow-lg hover:scale-105 transition"
        title="New Post"
      >
        <img src={postIcon} alt="Post" className="w-8 h-8" />
      </button>
    </div>
  );
}

export default MainPage;
