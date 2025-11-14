import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ratingIcon from "../assets/rating.png";
import commentIcon from "../assets/comment.png";
import viewsIcon from "../assets/views.png";
import deleteIcon from "../assets/delete.png"; // Add delete icon
// ✅ CORRECT - Should import from post.js
import { deletePost } from "../api/post"; // Add this
import { apiFetch } from "../api/apiClient"; // Keep this separate
import { fetchComments, createComment, likeComment, deleteComment } from "../api/comment"; // Import deleteComment
import { fetchMyProfile } from "../api/profileapi";

/* Helper functions from MainPage */
function resolveAvatarUrl(raw) {
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("/")) return `${window.location.origin}${raw}`;
  return `${window.location.origin}/${raw}`;
}

function Avatar({ src, name, size = 40 }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || "avatar"}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = (name || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [error, setError] = useState(null);
  const [commentsAvailable, setCommentsAvailable] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  // Add this useEffect at the top of BlogDetails component
  useEffect(() => {
    if (!isLoggedIn) {
      alert("Please log in to view post details.");
      navigate("/");
      return;
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    let mounted = true;

    const loadPostAndComments = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load current user profile if logged in
        if (isLoggedIn) {
          try {
            const userProfile = await fetchMyProfile();
            if (mounted) {
              setCurrentUser({
                username: userProfile.username || "User",
                fullName: userProfile.fullName || userProfile.username || "User",
                avatar: resolveAvatarUrl(userProfile.avatarUrl)
              });
            }
          } catch (userErr) {
            console.warn("Failed to load user profile:", userErr);
          }
        }

        // Try to fetch post data - this will automatically handle view tracking for logged-in users
        let postData;
        try {
          const data = await apiFetch(`/posts/${id}`);
          if (!mounted) return;

          postData = {
            id: data.id,
            title: data.title || "",
            username: data.username || data.author?.username || "Anonymous",
            content: data.content || "",
            createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
            rating: data.rating || 0,
            comments: data.comments || 0,
            views: data.views || 0,
            avatar: resolveAvatarUrl(data.avatarUrl || data.author?.avatarUrl),
            imageUrl: resolveAvatarUrl(data.imageUrl),
            isLikedByCurrentUser: data.isLikedByCurrentUser || false,
          };
        } catch (postErr) {
          console.warn("Direct post fetch failed, trying fallback:", postErr);
          // Fallback: fetch all posts and find the matching one
          const allPosts = await apiFetch("/posts");
          const postsArray = Array.isArray(allPosts) ? allPosts : allPosts?.posts ?? [];
          const foundPost = postsArray.find(p => p.id === parseInt(id));
          
          if (!foundPost) {
            throw new Error("Post not found");
          }

          postData = {
            id: foundPost.id,
            title: foundPost.title || "",
            username: foundPost.username || "Anonymous",
            content: foundPost.content || "",
            createdAt: foundPost.createdAt ? new Date(foundPost.createdAt) : new Date(),
            rating: foundPost.rating || 0,
            comments: foundPost.comments || 0,
            views: foundPost.views || 0,
            avatar: resolveAvatarUrl(foundPost.avatarUrl),
            imageUrl: resolveAvatarUrl(foundPost.imageUrl),
            isLikedByCurrentUser: foundPost.isLikedByCurrentUser || false,
          };

          // Track view for the fallback case (only for logged-in users)
          if (isLoggedIn) {
            try {
              await apiFetch(`/posts/${id}/view`, { method: "POST" });
            } catch (viewErr) {
              console.warn("Failed to track view:", viewErr);
            }
          }
        }

        if (!mounted) return;
        setPost(postData);

        // Try to load comments
        await loadComments();
      } catch (err) {
        console.error("Error loading post:", err);
        if (mounted) setError(err.message || "Failed to load post");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const loadComments = async () => {
      if (!mounted) return;
      
      setLoadingComments(true);
      try {
        const commentsData = await fetchComments(id);
        
        if (!mounted) return;

        setCommentsAvailable(true);
        
        const transformedComments = Array.isArray(commentsData) 
          ? commentsData.map(comment => ({
              id: comment.id,
              username: comment.username || comment.author?.username || "Anonymous",
              text: comment.content || comment.text || "",
              createdAt: comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "Recently",
              likes: comment.likes || comment.rating || 0,
              avatar: resolveAvatarUrl(comment.avatarUrl || comment.author?.avatarUrl),
              replies: comment.replies || [],
              isLikedByCurrentUser: comment.isLikedByCurrentUser || false,
            }))
          : [];
        
        setComments(transformedComments);
      } catch (err) {
        console.warn("Comments not available:", err);
        if (mounted) {
          setCommentsAvailable(false);
          setComments([]);
        }
      } finally {
        if (mounted) setLoadingComments(false);
      }
    };

    loadPostAndComments();
    
    return () => {
      mounted = false;
    };
  }, [id, isLoggedIn]);

  const handleDeletePost = async () => {
    if (!isLoggedIn) {
      alert("You need to log in to delete posts.");
      return;
    }

    // Check if current user owns the post
    if (currentUser && post.username === currentUser.username) {
      if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
        return;
      }

      try {
        await deletePost(id);
        alert("Post deleted successfully.");
        navigate("/"); // Redirect to home page after deletion
      } catch (err) {
        console.error("Failed to delete post:", err);
        alert("Failed to delete post. Please try again.");
      }
    } else {
      alert("You can only delete your own posts.");
    }
  };

  const handleDeleteComment = async (commentId, commentUsername) => {
    if (!isLoggedIn) {
      alert("You need to log in to delete comments.");
      return;
    }

    // Check if current user owns the comment
    if (currentUser && commentUsername === currentUser.username) {
      if (!window.confirm("Are you sure you want to delete this comment?")) {
        return;
      }

      try {
        const response = await deleteComment(id, commentId);
        
        // Remove comment from state
        setComments(prev => prev.filter(c => c.id !== commentId));
        
        // Update post comment count using the response from backend
        if (response.updatedCommentCount !== undefined) {
          setPost(prev => ({ 
            ...prev, 
            comments: response.updatedCommentCount 
          }));
        } else {
          // Fallback: decrement by 1
          setPost(prev => ({ 
            ...prev, 
            comments: Math.max((prev.comments || 1) - 1, 0) 
          }));
        }
        
      } catch (err) {
        console.error("Failed to delete comment:", err);
        alert("Failed to delete comment. Please try again.");
      }
    } else {
      alert("You can only delete your own comments.");
    }
  };

  const handleRate = async () => {
    if (!isLoggedIn) {
      alert("You need to log in to rate posts.");
      return;
    }

    const wasLiked = post?.isLikedByCurrentUser || false;

    // Toggle optimistic update
    setPost(prev => ({ 
      ...prev, 
      rating: wasLiked ? Math.max((prev.rating || 1) - 1, 0) : (prev.rating || 0) + 1,
      isLikedByCurrentUser: !wasLiked
    }));

    try {
      await apiFetch(`/posts/${id}/rate`, { method: "POST" });
    } catch (err) {
      console.error("Failed to rate post:", err);
      setPost(prev => ({ 
        ...prev, 
        rating: wasLiked ? (prev.rating || 0) + 1 : Math.max((prev.rating || 1) - 1, 0),
        isLikedByCurrentUser: wasLiked
      }));
      alert("Failed to rate post. Please try again.");
    }
  };

  const handleCreateComment = async () => {
    if (!isLoggedIn) {
      alert("You need to log in to comment.");
      return;
    }

    if (!newComment.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    setPostingComment(true);
    try {
      await createComment(id, newComment);
      
      // Refresh comments
      const commentsData = await fetchComments(id);
      const transformedComments = Array.isArray(commentsData) 
        ? commentsData.map(comment => ({
            id: comment.id,
            username: comment.username || comment.author?.username || "Anonymous",
            text: comment.content || comment.text || "",
            createdAt: comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "Recently",
            likes: comment.likes || comment.rating || 0,
            avatar: resolveAvatarUrl(comment.avatarUrl || comment.author?.avatarUrl),
            replies: comment.replies || [],
            isLikedByCurrentUser: comment.isLikedByCurrentUser || false,
          }))
        : [];
      
      setComments(transformedComments);
      setNewComment("");
      
      // Update post comment count optimistically
      setPost(prev => ({ ...prev, comments: (prev.comments || 0) + 1 }));
      
    } catch (err) {
      console.error("Failed to create comment:", err);
      alert("Comment functionality is not available at the moment.");
    } finally {
      setPostingComment(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!isLoggedIn) {
      alert("You need to log in to like comments.");
      return;
    }

    // Find the comment to check current like status
    const comment = comments.find(c => c.id === commentId);
    const wasLiked = comment?.isLikedByCurrentUser || false;

    // Toggle optimistic update
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: wasLiked ? Math.max((comment.likes || 1) - 1, 0) : (comment.likes || 0) + 1,
          isLikedByCurrentUser: !wasLiked
        };
      }
      return comment;
    }));

    try {
      await likeComment(id, commentId);
    } catch (err) {
      console.error("Failed to like comment:", err);
      // Revert optimistic update
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: wasLiked ? (comment.likes || 0) + 1 : Math.max((comment.likes || 1) - 1, 0),
            isLikedByCurrentUser: wasLiked
          };
        }
        return comment;
      }));
      alert("Failed to like comment. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 flex justify-center items-center relative">
        <Navbar />
        <div className="text-gray-400">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black text-white pl-24 flex justify-center items-center relative">
        <Navbar />
        <div className="text-center">
          <div className="text-red-400 mb-4">{error || "Post not found"}</div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pl-24 flex justify-center relative">
      <Navbar />

      <div className="w-full max-w-2xl mt-10 p-6 rounded-2xl shadow-lg" style={{ backgroundColor: "#181818", border: "1px solid #2d2d2d" }}>
        {/* Back Button and Delete Post Button */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          
          {/* Post Delete Button - only show if current user owns the post */}
          {currentUser && post && post.username === currentUser.username && (
            <button
              onClick={handleDeletePost}
              className="text-red-500 hover:text-red-400 transition flex items-center space-x-2 px-3 py-1 rounded-lg hover:bg-red-900 hover:bg-opacity-20"
            >
              <img src={deleteIcon} alt="Delete" className="w-4 h-4 invert" />
              <span>Delete Post</span>
            </button>
          )}
        </div>

        {/* Post Container */}
        <div className="w-full pb-6 border-b" style={{ borderColor: "#2d2d2d" }}>
          {/* User Info */}
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <Avatar src={post.avatar} name={post.username} size={48} />
            </div>
            <div className="ml-3">
              <h3 className="font-semibold text-white text-lg">{post.username}</h3>
              <p className="text-sm text-gray-400">{post.createdAt.toLocaleString()}</p>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-4">{post.title}</h1>

          {/* Body Content */}
          <p className="text-gray-200 mb-4 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>

          {/* Post Image */}
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="Post"
              className="w-full rounded-lg border mb-4"
              style={{ borderColor: "#2d2d2d", maxHeight: "500px", objectFit: "contain" }}
            />
          )}

          {/* Engagement Stats */}
          <div className="flex items-center justify-between text-gray-400 text-sm mt-4 pt-4" style={{ borderTop: "1px solid #2d2d2d" }}>
            <div className="flex space-x-6 items-center">
              <button
                onClick={handleRate}
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

              <div className="flex items-center space-x-1">
                <img src={commentIcon} alt="Comment" className="w-5 h-5 invert" />
                <span>{post.comments || 0}</span>
              </div>

              <div className="flex items-center space-x-1">
                <img src={viewsIcon} alt="Views" className="w-5 h-5 invert" />
                <span>{post.views || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">
            Comments ({commentsAvailable ? comments.length : "N/A"})
          </h2>

          {!commentsAvailable ? (
            <div className="text-center text-gray-500 py-4">
              Comment functionality is currently unavailable.
            </div>
          ) : loadingComments ? (
            <div className="text-gray-400 text-center py-4">Loading comments...</div>
          ) : (
            <div className="space-y-4">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="pb-4 border-b" style={{ borderColor: "#2d2d2d" }}>
                    <div className="flex items-start space-x-3">
                      <Avatar src={comment.avatar} name={comment.username} size={40} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white">{comment.username}</span>
                            <span className="text-gray-500 text-sm">{comment.createdAt}</span>
                          </div>
                          
                          {/* Comment Delete Button - only show if current user owns the comment */}
                          {currentUser && comment.username === currentUser.username && (
                            <button 
                              onClick={() => handleDeleteComment(comment.id, comment.username)}
                              className="text-red-500 hover:text-red-400 transition p-1 rounded hover:bg-red-900 hover:bg-opacity-20"
                              title="Delete comment"
                            >
                              <img src={deleteIcon} alt="Delete" className="w-4 h-4 invert opacity-70 hover:opacity-100" />
                            </button>
                          )}
                        </div>
                        <p className="text-gray-300 mb-2">{comment.text}</p>
                        <div className="flex items-center space-x-4 text-gray-500 text-sm">
                          <button 
                            onClick={() => handleLikeComment(comment.id)}
                            disabled={!isLoggedIn}
                            className={`hover:text-white transition flex items-center space-x-1 ${
                              !isLoggedIn ? "opacity-50 cursor-not-allowed" : ""
                            } ${comment.isLikedByCurrentUser ? "text-blue-400" : "text-gray-500"}`}
                          >
                            <img 
                              src={ratingIcon} 
                              alt="Like" 
                              className={`w-4 h-4 ${comment.isLikedByCurrentUser ? "" : "invert opacity-50"}`} 
                            />
                            <span>{comment.likes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
              )}
            </div>
          )}

          {/* Add Comment Input - Only show if comments are available */}
          {commentsAvailable && (
            <div className="mt-6 flex items-start space-x-3">
              <Avatar 
                src={currentUser?.avatar} 
                name={currentUser?.fullName || currentUser?.username} 
                size={40} 
              />
              <div className="flex-1">
                <textarea
                  placeholder={isLoggedIn ? `Write a comment, ${currentUser?.username || "User"}...` : "Log in to comment"}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!isLoggedIn || postingComment}
                  className="w-full bg-gray-900 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-600 resize-none"
                  rows="3"
                />
                <button
                  onClick={handleCreateComment}
                  disabled={!isLoggedIn || postingComment || !newComment.trim()}
                  className={`mt-2 px-4 py-2 bg-white text-black rounded-lg font-semibold ${
                    isLoggedIn && !postingComment && newComment.trim() 
                      ? "hover:bg-gray-300" 
                      : "opacity-50 cursor-not-allowed"
                  } transition`}
                >
                  {postingComment ? "Posting..." : "Comment"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}