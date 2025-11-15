import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ratingIcon from "../assets/rating.png";
import commentIcon from "../assets/comment.png";
import viewsIcon from "../assets/views.png";
import postIcon from "../assets/post.png";
import deleteIcon from "../assets/delete.png";
import { fetchPosts, deletePost } from "../api/post";
import { apiFetch } from "../api/apiClient";
import { fetchMyProfile } from "../api/profileapi";

/* Helper: convert relative -> absolute and accept many field names */
function resolveAvatarUrl(raw) {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return `${window.location.origin}${raw}`;
  return `${window.location.origin}/${raw}`;
}

function pickAvatarFromPost(post) {
  const candidates = [
    post.avatarUrl,
    post.avatar,
    post.profilePic,
    post.image,
    post.userAvatar,
    post.authorAvatar,
    post.author?.avatarUrl,
    post.user?.avatarUrl,
  ];
  const first = candidates.flat?.().find(Boolean) ?? candidates.find(Boolean);
  return first ? resolveAvatarUrl(first) : null;
}

function pickAvatarFromProfile(data) {
  const candidates = [
    data.avatarUrl,
    data.avatar,
    data.profilePic,
    data.picture,
    data.imageUrl,
    data.avatar_url,
  ];
  const first = candidates.find(Boolean);
  return first ? resolveAvatarUrl(first) : null;
}

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

export default function MainPage() {
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState([]);
  const [me, setMe] = useState(null); // current user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    let mounted = true;

    const loadPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1️⃣ Fetch current user profile ONLY if logged in
        let currentUser = null;
        if (isLoggedIn) {
          try {
            const profile = await fetchMyProfile();
            if (!mounted) return;

            currentUser = {
              username: profile.username ?? profile.fullName ?? "You",
              fullName: profile.fullName ?? profile.username ?? "You",
              avatar: pickAvatarFromProfile(profile),
            };
            setMe(currentUser);
          } catch (err) {
            console.warn("Failed to load current profile:", err);
            if (mounted) setMe(null);
          }
        } else {
          // For guests, set me to null
          setMe(null);
        }

        // 2️⃣ Fetch posts (this should work for both guests and logged-in users)
        const data = await fetchPosts();
        console.log(data);
        const postsArray = Array.isArray(data) ? data : data?.posts ?? [];
        if (!mounted) return;

        const mappedPosts = postsArray.map((p) => ({
          id: p.id,
          username: p.username || p.author?.username || p.user?.username || "Anonymous",
          title: p.title ?? "",
          content: p.content ?? "",
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          rating: p.rating ?? 0,
          comments: p.comments ?? 0,
          views: p.views ?? 0,
          avatar: pickAvatarFromPost(p) || null,
          imageUrl: resolveAvatarUrl(p.imageUrl ?? p.image ?? p.filePath ?? p.postImage ?? null),
          isLikedByCurrentUser: p.isLikedByCurrentUser ?? false,
        }));

        if (!mounted) return;
        setPosts(mappedPosts);
      } catch (err) {
        console.error("Error loading posts:", err);
        if (mounted) setError(err.message || "Failed to load posts");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPosts();
    return () => {
      mounted = false;
    };
  }, [isLoggedIn]); // Add isLoggedIn as dependency

  const handleNewPost = () => {
    if (!isLoggedIn) {
      alert("You need to log in to create a post.");
      return;
    }
    navigate("/postblog", { state: { title: newPost } });
  };

  const handleDeletePost = async (postId, e) => {
    e.stopPropagation(); // Prevent triggering the post click
    
    if (!isLoggedIn) {
      alert("You need to log in to delete posts.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      await deletePost(postId);
      // Remove the post from the state
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post. Please try again.");
    }
  };

  const handleRate = async (id, e) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      alert("You need to log in to rate posts.");
      return;
    }

    // Find the post to check current like status
    const post = posts.find(p => p.id === id);
    const wasLiked = post?.isLikedByCurrentUser || false;

    // Toggle optimistic update
    setPosts(prev => prev.map(p => 
      p.id === id ? { 
        ...p, 
        rating: wasLiked ? Math.max((p.rating || 1) - 1, 0) : (p.rating || 0) + 1,
        isLikedByCurrentUser: !wasLiked
      } : p
    ));

    try {
      await apiFetch(`/posts/${id}/rate`, { method: "POST" });
    } catch (err) {
      console.error("Failed to rate post:", err);
      // Revert optimistic update
      setPosts(prev => prev.map(p => 
        p.id === id ? { 
          ...p, 
          rating: wasLiked ? (p.rating || 0) + 1 : Math.max((p.rating || 1) - 1, 0),
          isLikedByCurrentUser: wasLiked
        } : p
      ));
      alert("Failed to rate post. Please try again.");
    }
  };

  const handleComment = (id, e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      alert("Please log in to view post details and comments.");
      return;
    }
    navigate(`/posts/${id}`);
  };

  const handlePostClick = async (id) => {
    if (!isLoggedIn) {
      alert("Please log in to view post details.");
      return;
    }
    
    // Track view for logged-in users
    try {
      await apiFetch(`/posts/${id}/view`, { method: "POST" });
    } catch (viewErr) {
      console.warn("Failed to track view:", viewErr);
    }
    
    navigate(`/posts/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 flex justify-center items-center relative">
        <Navbar />
        <div className="text-gray-400">Loading posts…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pl-24 flex justify-center relative">
      <Navbar />

      <div className="w-full max-w-2xl mt-10 p-6 rounded-2xl shadow-lg" style={{ backgroundColor: "#181818", border: "1px solid #2d2d2d" }}>

        {/* New Post Input */}
        <div className="mb-8 flex items-center space-x-3">
          <Avatar 
            src={me?.avatar} 
            name={isLoggedIn ? (me?.fullName || me?.username) : "Guest"} 
            size={40} 
          />
          <input
            placeholder={isLoggedIn ? `What's on your mind, ${me?.username ?? "you"}?` : "Log in to create posts"}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            onClick={!isLoggedIn ? () => alert("Please log in to create posts.") : undefined}
            readOnly={!isLoggedIn}
            className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none cursor-pointer"
          />
          <button 
            onClick={handleNewPost} 
            className={`px-4 py-1.5 border border-gray-600 rounded-lg ${
              isLoggedIn ? "hover:bg-gray-900" : "opacity-50 cursor-not-allowed"
            }`}
            disabled={!isLoggedIn}
          >
            Post
          </button>
        </div>

        <hr className="mb-6" style={{ borderColor: "#2d2d2d", borderTop: "1px solid #2d2d2d", width: "100%" }} />

        {error && <div className="text-red-400 mb-4">{error}</div>}

        <div className="space-y-8">
          {posts.length > 0 ? (
            posts.map((post) => (
              <React.Fragment key={post.id}>
                {/* Post Container - Now Clickable */}
                <div 
                  onClick={() => handlePostClick(post.id)}
                  className={`w-full pb-6 border-b cursor-pointer transition-colors rounded-lg p-4 -m-4 ${
                    isLoggedIn ? "hover:bg-gray-900 hover:bg-opacity-30" : "cursor-not-allowed"
                  }`}
                  style={{ borderColor: "#2d2d2d" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Avatar src={post.avatar} name={post.username} size={40} />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-white">{post.username}</h3>
                        <p className="text-sm text-gray-400">{post.createdAt.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {/* Delete button - only show if current user owns the post */}
                    {me && post.username === me.username && (
                      <button 
                        onClick={(e) => handleDeletePost(post.id, e)}
                        className="text-red-500 hover:text-red-400 transition p-2 rounded-full hover:bg-red-900 hover:bg-opacity-20"
                        title="Delete post"
                      >
                        <img src={deleteIcon} alt="Delete" className="w-5 h-5 invert opacity-70 hover:opacity-100" />
                      </button>
                    )}
                  </div>

                  {/* Show Title only */}
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
                        disabled={!isLoggedIn}
                        className={`flex items-center space-x-1 transition ${
                          isLoggedIn ? "hover:text-white" : "opacity-50 cursor-not-allowed"
                        }`}
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
            <p className="text-center text-gray-500 mt-10">No blog posts available yet.</p>
          )}
        </div>
      </div>

      <button 
        onClick={() => (isLoggedIn ? navigate("/postblog") : alert("You need to log in to create a post."))} 
        className="fixed bottom-10 right-10 bg-white rounded-full p-4 shadow-lg hover:scale-105 transition" 
        title="New Post"
      >
        <img src={postIcon} alt="Post" className="w-8 h-8" />
      </button>
    </div>
  );
}