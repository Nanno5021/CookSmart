import React, { useEffect, useState } from "react";
import { fetchMyProfile } from "../api/profileapi";
import { apiFetch } from "../api/apiClient"; 
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import picture from "../assets/pfp.png";
import ratingIcon from "../assets/rating.png";
import commentIcon from "../assets/comment.png";
import viewsIcon from "../assets/views.png";

function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Threads");
  const [newPost, setNewPost] = useState("");
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    async function loadProfile() {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchMyProfile();

        setUserData({
          fullName: data.fullName || "Unknown",
          username: data.username || "unknown",
          profilePic: data.avatarUrl || picture,
        });

        const mappedPosts = (data.posts || []).map((p) => ({
          id: p.id,
          username: data.username,
          content: p.content ?? "",
          createdAt: new Date(p.createdAt),
          rating: p.rating ?? 0,
          comments: p.comments ?? 0,
          views: p.views ?? 0,
        }));

        setPosts(mappedPosts);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [isLoggedIn]);

  const handleNewPost = () => {
    if (!isLoggedIn) return alert("Please log in to post.");
    navigate("/postblog", { state: { title: newPost } });
  };

  const handleRate = async (id) => {
    if (!isLoggedIn) return alert("Please log in to rate.");
    await apiFetch(`/posts/${id}/rate`, { method: "POST" });
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, rating: p.rating + 1 } : p));
  };

  const handleComment = (id) => navigate(`/posts/${id}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 flex justify-center items-center">
        <Navbar />
        <span className="text-gray-400">Loading profile…</span>
      </div>
    );
  }

  const displayUser = userData || { fullName: "Unknown", username: "unknown", profilePic: picture };

  return (
    <div className="min-h-screen bg-black text-white pl-24 flex justify-center">
      <Navbar />

      <div className="w-full max-w-2xl mt-10 p-6 rounded-2xl shadow-lg" style={{ backgroundColor: "#181818" }}>
        
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{displayUser.fullName}</h1>
              <p className="text-gray-400">@{displayUser.username}</p>
            </div>
            <img src={displayUser.profilePic} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
          </div>

          <button
            onClick={() => navigate("/editprofile")}
            className="w-full border border-gray-600 rounded-lg py-2 hover:bg-gray-800 transition"
          >
            Edit profile
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          {["Threads", "Replies"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center font-semibold ${
                activeTab === tab ? "text-white border-b-2 border-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Create New Post */}
        {activeTab === "Threads" && (
          <div className="mb-8 flex items-center space-x-3">
            <img src={displayUser.profilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
            <input
              placeholder="What's new?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
            />
            <button onClick={handleNewPost} className="px-4 py-1.5 border border-gray-600 rounded-lg hover:bg-gray-900">
              Post
            </button>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {activeTab === "Threads" && posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="pb-6 border-b border-gray-800">
                <div className="flex items-center space-x-3 mb-2">
                  <img src={displayUser.profilePic} className="w-10 h-10 rounded-full" />
                  <h3 className="font-semibold">{post.username}</h3>
                  <span className="text-sm text-gray-400">{post.createdAt.toLocaleDateString()}</span>
                </div>
                <p className="text-gray-200 mb-4">{post.content}</p>
                <div className="flex items-center space-x-6 text-gray-400 text-sm">
                  <button onClick={() => handleRate(post.id)} className="flex items-center space-x-1 hover:text-white">
                    <img src={ratingIcon} className="w-5 h-5 invert" /><span>{post.rating}</span>
                  </button>
                  <button onClick={() => handleComment(post.id)} className="flex items-center space-x-1 hover:text-white">
                    <img src={commentIcon} className="w-5 h-5 invert" /><span>{post.comments}</span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <img src={viewsIcon} className="w-5 h-5 invert" /><span>{post.views}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No posts yet.</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProfilePage;
