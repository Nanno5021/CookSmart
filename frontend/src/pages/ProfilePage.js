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

/* Avatar component from MainPage */
function Avatar({ src, name, size = 40 }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || "avatar"}
        className={`rounded-full object-cover`}
        style={{ width: size, height: size }}
      />
    );
  }
  // fallback: initials circle
  const initials = (name || "U").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
  return (
    <div
      title={name || "User"}
      style={{
        width: size,
        height: size,
        borderRadius: "9999px",
        backgroundColor: "#2a2a2a",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
      }}
    >
      {initials}
    </div>
  );
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
        console.log("Profile API response:", data);

        // Set user info
        setUserData({
          fullName: data.fullName || "Unknown",
          username: data.username || "unknown",
          profilePic: data.avatarUrl ? resolveImageUrl(data.avatarUrl) : picture,
        });

        // Map posts from API - using MainPage style mapping
        const mappedPosts = (data.posts || []).map((p) => {
          console.log("Raw post data from profile:", p);
          
          return {
            id: p.id,
            username: data.username,
            title: p.title ?? "",
            content: p.content ?? "",
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
            rating: p.rating ?? 0,
            comments: p.comments ?? 0,
            views: p.views ?? 0,
            avatar: data.avatarUrl ? resolveImageUrl(data.avatarUrl) : picture,
            imageUrl: p.imageUrl ? resolveImageUrl(p.imageUrl) : null,
            isLikedByCurrentUser: p.isLikedByCurrentUser ?? false, // Add this
          };
        });

        console.log("Mapped posts with images:", mappedPosts);
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

  const handleRate = async (id, e) => {
    e.stopPropagation();
    
    if (!isLoggedIn) return alert("Please log in to rate.");
    
    // Find the post to check current like status
    const post = posts.find(p => p.id === id);
    const wasLiked = post?.isLikedByCurrentUser || false;

    // Toggle optimistic update
    setPosts((prev) => prev.map((p) => 
      p.id === id ? { 
        ...p, 
        rating: wasLiked ? Math.max(p.rating - 1, 0) : p.rating + 1,
        isLikedByCurrentUser: !wasLiked
      } : p
    ));
    
    try {
      await apiFetch(`/posts/${id}/rate`, { method: "POST" });
    } catch (err) {
      console.error("Failed to rate post:", err);
      // Revert on error
      setPosts((prev) => prev.map((p) => 
        p.id === id ? { 
          ...p, 
          rating: wasLiked ? p.rating + 1 : Math.max(p.rating - 1, 0),
          isLikedByCurrentUser: wasLiked
        } : p
      ));
      alert("Failed to rate post. Please try again.");
    }
  };

  const handleComment = (id, e) => {
    e.stopPropagation();
    navigate(`/posts/${id}`);
  };

  const handlePostClick = async (id) => {
    // Track view for logged-in users (same logic as BlogDetails)
    if (isLoggedIn) {
      try {
        await apiFetch(`/posts/${id}/view`, { method: "POST" });
      } catch (viewErr) {
        console.warn("Failed to track view:", viewErr);
      }
    }
    
    navigate(`/posts/${id}`);
  };

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
            <Avatar 
              src={displayUser.profilePic} 
              name={displayUser.fullName} 
              size={40} 
            />
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

        {/* Posts - Updated to match MainPage style */}
        <div className="space-y-8">
          {activeTab === "Posts" && posts.length > 0 ? (
            posts.map((post) => (
              <React.Fragment key={post.id}>
                {/* Post Container - Clickable like MainPage */}
                <div 
                  onClick={() => handlePostClick(post.id)}
                  className="w-full pb-6 border-b cursor-pointer hover:bg-gray-900 hover:bg-opacity-30 transition-colors rounded-lg p-4 -m-4" 
                  style={{ borderColor: "#2d2d2d" }}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Avatar src={post.avatar} name={post.username} size={40} />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-white">{post.username}</h3>
                      <p className="text-sm text-gray-400">{post.createdAt.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Show Title only like MainPage */}
                  <h2 className="text-xl font-bold text-white mb-4">{post.title || "Untitled Post"}</h2>

                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="max-w-full max-h-96 rounded-lg border border-b mx-auto" 
                      style={{ borderColor: "#2d2d2d" }}
                    />
                  )}

                  <div className="flex items-center justify-between text-gray-400 text-sm mt-4">
                    <div className="flex space-x-6 items-center">
                      <button 
                        onClick={(e) => handleRate(post.id, e)} 
                        disabled={!isLoggedIn} 
                        className={`flex items-center space-x-1 transition ${
                          isLoggedIn ? "hover:text-white" : "opacity-50 cursor-not-allowed"
                        } ${post.isLikedByCurrentUser ? "text-blue-400" : "text-gray-400"}`}
                      >
                        <img 
                          src={ratingIcon} 
                          alt="Rating" 
                          className={`w-5 h-5 ${post.isLikedByCurrentUser ? "" : "invert"}`} 
                        />
                        <span>{post.rating || 0}</span>
                      </button>

                      <button 
                        onClick={(e) => handleComment(post.id, e)} 
                        className="flex items-center space-x-1 hover:text-white transition"
                      >
                        <img src={commentIcon} alt="Comment" className="w-5 h-5 invert" />
                        <span>{post.comments || 0}</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        <img src={viewsIcon} alt="Views" className="w-5 h-5 invert" />
                        <span>{post.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
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