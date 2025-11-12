import React, { useState, useEffect } from 'react';
import { fetchAllBlogs, deleteBlog } from '../../api/manageBlogApi';
import BlogDetailsPage from './BlogDetailsPage';
import EditBlogPage from './EditBlogPage';
import { Eye, Trash2, Edit } from 'lucide-react';

function ManageBlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [editingBlogId, setEditingBlogId] = useState(null);

  // Delete Dialog
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllBlogs();
      setBlogs(data);
    } catch (err) {
      setError(err.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  // --- VIEW DETAILS ---
  const handleViewDetails = (id) => setSelectedBlogId(id);
  
  // --- EDIT BLOG ---
  const handleEditBlog = (id) => setEditingBlogId(id);
  
  const handleBackToList = () => {
    setSelectedBlogId(null);
    setEditingBlogId(null);
    loadBlogs();
  };

  // --- DELETE ---
  const openDeleteDialog = (id) => {
    setDeleteId(id);
  };

  const performDelete = async () => {
    try {
      setDeleting(true);
      await deleteBlog(deleteId);
      setBlogs((prev) => prev.filter((b) => b.id !== deleteId));
      setDeleteId(null);
      alert('Blog post deleted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to delete blog post');
    } finally {
      setDeleting(false);
    }
  };

  // Handle different views
  if (selectedBlogId || editingBlogId) {
    if (editingBlogId) {
      return <EditBlogPage blogId={editingBlogId} onBack={handleBackToList} onSave={loadBlogs} />;
    }
    if (selectedBlogId) {
      return (
        <BlogDetailsPage
          blogId={selectedBlogId}
          onBack={handleBackToList}
          onEdit={setEditingBlogId}
        />
      );
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={loadBlogs} />;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8">Manage Blog Posts</h2>

      {blogs.length === 0 ? (
        <EmptyState />
      ) : (
        <BlogsTable
          blogs={blogs}
          onViewDetails={handleViewDetails}
          onEdit={handleEditBlog}
          onDelete={openDeleteDialog}
        />
      )}

      {/* ---------- DELETE DIALOG ---------- */}
      {deleteId !== null && (
        <Modal onClose={() => setDeleteId(null)}>
          <h3 className="text-xl font-bold mb-4">Delete Blog Post</h3>
          <p className="text-gray-400 mb-6">
            Are you sure you want to delete this blog post? This action cannot
            be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={performDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Yes, Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8">Manage Blog Posts</h2>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
        <p className="text-gray-400">Loading blog posts…</p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8">Manage Blog Posts</h2>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
        <p className="text-red-400">{error}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
      <p className="text-gray-400">No blog posts found</p>
    </div>
  );
}

function BlogsTable({ blogs, onViewDetails, onEdit, onDelete }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <table className="w-full">
        <thead className="bg-zinc-800">
          <tr>
            <th className="text-left p-4 font-semibold">Title</th>
            <th className="text-left p-4 font-semibold">Author</th>
            <th className="text-left p-4 font-semibold">Date</th>
            <th className="text-left p-4 font-semibold">Stats</th>
            <th className="text-center p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {blogs.map((blog) => (
            <tr key={blog.id} className="border-t border-zinc-800">
              <td className="p-4 max-w-md">
                <div className="flex items-center space-x-3">
                  {blog.imageUrl && (
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold truncate">{blog.title}</p>
                    <p className="text-sm text-gray-400 truncate">
                      {blog.content?.substring(0, 50)}...
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-4 text-gray-400">{blog.authorName}</td>
              <td className="p-4 text-gray-400">
                {new Date(blog.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 text-gray-400 text-sm">
                <div className="space-y-1">
                  <div>⭐ {blog.rating} ratings</div>
                  <div>💬 {blog.comments} comments</div>
                  <div>👁 {blog.views} views</div>
                </div>
              </td>
              <td className="p-4 space-x-2">
                <button
                  onClick={() => onViewDetails(blog.id)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition inline-flex items-center space-x-2"
                >
                  <Eye size={16} />
                  <span>View</span>
                </button>
                <button
                  onClick={() => onEdit(blog.id)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition inline-flex items-center space-x-2"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDelete(blog.id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition inline-flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 max-w-lg w-full p-6">
        {children}
      </div>
    </div>
  );
}

export default ManageBlogPage;