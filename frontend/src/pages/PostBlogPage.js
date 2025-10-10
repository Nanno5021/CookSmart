import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import picture from "../assets/pfp.png";
import imageIcon from "../assets/picture.png";
import { createPost } from "../api/post"; // ✅ Make sure file name matches (e.g., postApi.js)

function PostBlogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [title, setTitle] = useState(location.state?.title || "");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);

  // ✅ Handle Post submission
  const handlePost = async (e) => {
    e.preventDefault();

    try {
      const postData = {
        title,
        content: body,
        createdAt: new Date().toISOString(),
      };

      console.log("🟢 Posting data:", postData);

      // ✅ Use your API helper that attaches JWT token
      const res = await createPost(postData);

      console.log("✅ Post created:", res);
      alert("Post created successfully!");
      navigate("/"); // Redirect to home
    } catch (error) {
      console.error("❌ Error creating post:", error);
      alert("Failed to post. Check console for details.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
      <div className="bg-[#181818] text-white rounded-2xl shadow-lg p-8 w-full max-w-2xl relative">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white font-semibold"
          >
            Cancel
          </button>
          <h2 className="text-xl font-bold">New Blog</h2>
          <div className="w-16" />
        </div>

        {/* Profile */}
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={picture}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <span className="font-semibold text-lg">ChefLiam</span>
        </div>

        {/* Image Placeholder */}
        <label className="w-24 h-24 bg-gray-800 flex justify-center items-center rounded-lg mb-6 cursor-pointer hover:bg-gray-700 transition">
          <img src={imageIcon} alt="Upload" className="w-10 h-10 opacity-70" />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </label>

        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-white text-lg mb-4 pb-1"
        />

        {/* Context Label */}
        <p className="text-gray-400 text-sm mb-2">Context</p>

        {/* Body Text Area */}
        <textarea
          placeholder="Body Text.... (required)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full h-48 bg-transparent border border-gray-600 rounded-lg p-3 text-gray-200 resize-none focus:outline-none focus:border-white mb-6"
        />

        {/* Post Button */}
        <button
          onClick={handlePost}
          className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
        >
          Post
        </button>
      </div>
    </div>
  );
}

export default PostBlogPage;
