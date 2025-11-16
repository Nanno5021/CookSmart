import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Upload, RotateCcw, Save, Award } from 'lucide-react';
import { fetchUserById, updateUser, uploadAvatar, resetAvatar } from '../../api/manageUserApi';
import EditChefProfile from './EditChefProfile';

function EditUserPage({ userId, onBack, onSave }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingChef, setEditingChef] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserById(userId);
      setUser(data);
      setFormData({
        fullName: data.fullName || '',
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load user details');
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
    try {
      setSaving(true);
      await updateUser(userId, formData);
      alert('User profile updated successfully!');
      if (onSave) await onSave(); 
      onBack();
    } catch (err) {
      console.error('Save error:', err);
      alert(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
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
      setUploadingAvatar(true);
      const response = await uploadAvatar(userId, file);
      
      // Update the user state with new avatar URL
      setUser(prev => ({ 
        ...prev, 
        avatarUrl: response.avatarUrl 
      }));
      
      alert('Avatar uploaded successfully!');
    } catch (err) {
      alert(err.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      // Clear the input
      e.target.value = '';
    }
  };

  // FIXED: Reset avatar function
  const handleResetAvatar = async () => {
    if (!window.confirm('Are you sure you want to reset the avatar to default?')) {
      return;
    }

    try {
      setUploadingAvatar(true);
      const response = await resetAvatar(userId);
      
      // Update the user state with new avatar URL
      setUser(prev => ({ 
        ...prev, 
        avatarUrl: response.avatarUrl 
      }));
      
      alert('Avatar reset to default!');
    } catch (err) {
      console.error('Reset avatar error:', err);
      alert(err.message || 'Failed to reset avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // FIXED: Back button handler
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };


if (editingChef && user) {
  return (
    <EditChefProfile
      userId={user.id}  // ✅ Pass userId instead of user
      onBack={() => setEditingChef(false)}
      onSave={async () => {
        await loadUserDetails(); // Reload user data
        if (onSave) await onSave();
      }}
    />
  );
}

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
          <p className="text-gray-400">Loading user details...</p>
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
            onClick={loadUserDetails}
            className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const avatarUrl = user?.avatarUrl 
    ? `${user.avatarUrl}` 
    : null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Users</span>
        </button>
        <h2 className="text-3xl font-bold">Edit User Profile</h2>
        <div className="w-32"></div> 
      </div>

      {/* Chef Profile Edit Section */}
      {user?.role === 'Chef' && user.chefProfile && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Chef Profile</h3>
              <p className="text-gray-400">Manage chef-specific information</p>
            </div>
            <button
              onClick={() => setEditingChef(true)}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg transition inline-flex items-center space-x-2"
            >
              <Award size={18} />
              <span>Edit Chef Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Avatar Section */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 mb-6">
        <h3 className="text-xl font-bold mb-6">Profile Picture</h3>
        
        <div className="flex items-center space-x-8">
          {/* Avatar Display */}
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.fullName}
                className="w-32 h-32 rounded-full object-cover border-4 border-zinc-800"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-zinc-800 flex items-center justify-center border-4 border-zinc-700">
                <User size={48} className="text-gray-400" />
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>

          {/* Avatar Controls */}
          <div className="flex-1 space-y-4">
            <div>
              <label
                htmlFor="avatar-upload"
                className={`px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition cursor-pointer inline-flex items-center space-x-2 ${
                  uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload size={18} />
                <span>Upload New Avatar</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </div>

            <button
              onClick={handleResetAvatar}
              disabled={uploadingAvatar}
              className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw size={18} />
              <span>Reset to Default</span>
            </button>

            <p className="text-sm text-gray-400">
              Allowed: JPG, JPEG, PNG, GIF • Max size: 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Profile Information Form */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
        <h3 className="text-xl font-bold mb-6">Profile Information</h3>

        <div className="space-y-6">
          {/* Full Name */}
          <FormField
            icon={<User size={20} />}
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter full name"
          />

          {/* Username */}
          <FormField
            icon={<User size={20} />}
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter username"
          />

          {/* Email */}
          <FormField
            icon={<Mail size={20} />}
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email"
          />

          {/* Phone */}
          <FormField
            icon={<Phone size={20} />}
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
          />
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

function FormField({ icon, label, name, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {label}
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
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
        />
      </div>
    </div>
  );
}

export default EditUserPage;