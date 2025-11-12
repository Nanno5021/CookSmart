import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, User, Upload, RotateCcw, Save, Image as ImageIcon } from 'lucide-react';
import { fetchBlogById, updateBlog, uploadBlogImage, removeBlogImage } from '../../api/manageBlogApi';

function EditBlogPage({ blogId, onBack, onSave }) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    loadBlogDetails();
  }, [blogId]);

  const loadBlogDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBlogById(blogId);
      setBlog(data);
      setFormData({
        title: data.title || '',
        content: data.content || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load blog details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }
    if (!formData.content.trim()) {
      alert('Content is required');
      return;
    }

    try {
      setSaving(true);
      await updateBlog(blogId, formData);
      alert('Blog post updated successfully!');
      if (onSave) await onSave();
      onBack();
    } catch (err) {
      console.error('Save error:', err);
      alert(err.message || 'Failed to update blog post');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const response = await uploadBlogImage(blogId, file);
      
      // Update the blog state with new image URL
      setBlog(prev => ({ 
        ...prev, 
        imageUrl: response.imageUrl 
      }));
      
      alert('Image uploaded successfully!');
    } catch (err) {
      alert(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm('Are you sure you want to remove the featured image?')) {
      return;
    }

    try {
      setUploadingImage(true);
      await removeBlogImage(blogId);
      
      // Update the blog state
      setBlog(prev => ({ 
        ...prev, 
        imageUrl: null 
      }));
      
      alert('Image removed successfully!');
    } catch (err) {
      console.error('Remove image error:', err);
      alert(err.message || 'Failed to remove image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-gray-400">Loading blog details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadBlogDetails}
            className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Blogs</span>
        </button>
        <h2 className="text-3xl font-bold">Edit Blog Post</h2>
        <div className="w-32"></div>
      </div>

      {/* Blog Metadata */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-gray-400">
            <div className="flex items-center space-x-2">
              <User size={18} />
              <span>{blog.authorName}</span>
            </div>
            <div>•</div>
            <div>
              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>⭐ {blog.rating} ratings</span>
            <span>💬 {blog.comments} comments</span>
            <span>👁 {blog.views} views</span>
          </div>
        </div>
      </div>

      {/* Featured Image Section */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 mb-6">
        <h3 className="text-xl font-bold mb-6">Featured Image</h3>
        
        <div className="space-y-4">
          {/* Image Display */}
          {blog.imageUrl ? (
            <div className="relative">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="w-full h-64 object-cover rounded-lg border-4 border-zinc-800"
              />
              {uploadingImage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-zinc-800 rounded-lg border-4 border-zinc-700 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">No featured image</p>
              </div>
            </div>
          )}

          {/* Image Controls */}
          <div className="flex items-center space-x-4">
            <label
              htmlFor="image-upload"
              className={`px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition cursor-pointer inline-flex items-center space-x-2 ${
                uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload size={18} />
              <span>{blog.imageUrl ? 'Change Image' : 'Upload Image'}</span>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploadingImage}
            />

            {blog.imageUrl && (
              <button
                onClick={handleRemoveImage}
                disabled={uploadingImage}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={18} />
                <span>Remove Image</span>
              </button>
            )}
          </div>

          <p className="text-sm text-gray-400">
            Allowed: JPG, JPEG, PNG, GIF • Max size: 5MB
          </p>
        </div>
      </div>

      {/* Blog Content Form */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
        <h3 className="text-xl font-bold mb-6">Blog Content</h3>

        <div className="space-y-6">
          {/* Title */}
          <FormField
            icon={<FileText size={20} />}
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter blog title"
            required
          />

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write your blog content here..."
              rows={15}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-vertical"
              required
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-zinc-800">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ icon, label, name, type = 'text', value, onChange, placeholder, required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
        />
      </div>
    </div>
  );
}

export default EditBlogPage;