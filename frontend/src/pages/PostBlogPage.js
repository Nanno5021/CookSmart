import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import picture from "../assets/pfp.png";
import imageIcon from "../assets/picture.png";
import { createPost } from "../api/post";
import { apiFetch } from "../api/apiClient"; // import apiFetch to call /profile/me

function PostBlogPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState(location.state?.title || "");
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState({ username: "Anonymous", profilePic: picture });
  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch current logged-in user from backend
  useEffect(() => {
    let mounted = true;
    async function fetchUser() {
      setLoadingUser(true);
      try {
        const data = await apiFetch("/profile/me"); // GET api/profile/me
        if (mounted) {
          setUser({
            username: data.username || "Anonymous",
            profilePic: data.avatarUrl || picture,
          });
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        if (mounted) setUser({ username: "Anonymous", profilePic: picture });
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }

    fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("Title and body cannot be empty.");
      return;
    }

    try {
      const postData = {
        title,
        content: body,
        createdAt: new Date().toISOString(),
        username: user.username, // attach logged-in user's username
      };

      console.log("🟢 Posting data:", postData);

      const res = await createPost(postData);

      console.log("✅ Post created:", res);
      alert("Post created successfully!");
      navigate("/");
    } catch (error) {
      console.error("❌ Error creating post:", error);
      alert(error.message);
      if (error.message.includes("Unauthorized")) navigate("/login");
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white bg-black">
        Loading user info...
      </div>
    );
  }

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
            src={user.profilePic}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <span className="font-semibold text-lg">{user.username}</span>
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
