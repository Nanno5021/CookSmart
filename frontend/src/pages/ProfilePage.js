import React, { useEffect, useState } from "react";
import { fetchMyProfile } from "../api/profileapi";
import { apiFetch } from "../api/apiClient"; 
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import picture from "../assets/pfp.png";
import ratingIcon from "../assets/rating.png";
import commentIcon from "../assets/comment.png";
import viewsIcon from "../assets/views.png";

/* Helper: convert relative -> absolute URLs */
function resolveImageUrl(raw) {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return `${window.location.origin}${raw}`;
  return `${window.location.origin}/${raw}`;
}

function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Posts");
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
        console.log("Profile API response:", data); // Debug log

        // Set user info
        setUserData({
          fullName: data.fullName || "Unknown",
          username: data.username || "unknown",
          profilePic: data.avatarUrl ? resolveImageUrl(data.avatarUrl) : picture,
        });

        // Map posts from API - use the same logic as MainPage
        const mappedPosts = (data.posts || []).map((p) => {
          console.log("Raw post data from profile:", p); // Debug each post
          
          return {
            id: p.id,
            username: data.username,
            content: p.content ?? p.title ?? "",
            createdAt: new Date(p.createdAt),
            rating: p.rating ?? 0,
            comments: p.comments ?? 0,
            views: p.views ?? 0,
            imageUrl: p.imageUrl ? resolveImageUrl(p.imageUrl) : null, // Use the imageUrl directly
          };
        });

        console.log("Mapped posts with images:", mappedPosts); // Debug log
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
    
    // Optimistic update
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, rating: p.rating + 1 } : p));
    
    try {
      await apiFetch(`/posts/${id}/rate`, { method: "POST" });
    } catch (err) {
      console.error("Failed to rate post:", err);
      // Revert on error
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, rating: Math.max(p.rating - 1, 0) } : p));
      alert("Failed to rate post. Please try again.");
    }
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

  const displayUser = userData || { 
    fullName: "Unknown", 
    username: "unknown", 
    profilePic: picture 
  };

  return (
    <div className="min-h-screen bg-black text-white pl-24 flex justify-center">
      <Navbar />

      <div className="w-full max-w-2xl mt-10 p-6 rounded-2xl shadow-lg" style={{ backgroundColor: "#181818", border: "1px solid #2d2d2d" }}>
        
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{displayUser.fullName}</h1>
              <p className="text-gray-400">@{displayUser.username}</p>
            </div>
            <img 
              src={displayUser.profilePic} 
              alt="Profile" 
              className="w-20 h-20 rounded-full object-cover" 
            />
          </div>

          <button
            onClick={() => navigate("/editprofile")}
            className="w-full border rounded-lg py-2 transition"
            style={{ borderColor: "#2d2d2d" }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#2d2d2d"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >
            Edit profile
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6" style={{ borderColor: "#2d2d2d" }}>
          {["Posts", "Replies"].map((tab) => (
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
        {activeTab === "Posts" && (
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

        <hr className="mb-6" style={{ borderColor: "#2d2d2d", borderTop: "1px solid #2d2d2d", width: "100%" }} />

        {/* Posts */}
        <div className="space-y-6">
          {activeTab === "Posts" && posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="pb-6 border-b" style={{ borderColor: "#2d2d2d" }}>
                <div className="flex items-center space-x-3 mb-2">
                  <img src={displayUser.profilePic} className="w-10 h-10 rounded-full object-cover" />
                  <h3 className="font-semibold">{post.username}</h3>
                  <span className="text-sm text-gray-400">{post.createdAt.toLocaleDateString()}</span>
                </div>

                {/* Post image (if exists) */}
                {post.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="max-w-full max-h-96 rounded-lg border border-b mx-auto" style={{ borderColor: "#2d2d2d" }}
                    />
                  </div>
                )}

                <p className="text-gray-200 mb-4 whitespace-pre-wrap">{post.content}</p>

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