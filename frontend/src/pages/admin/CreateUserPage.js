import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Lock, Shield, Save } from 'lucide-react';

function CreateUserPage({ onBack, onUserCreated }) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'User',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields correctly');
      return;
    }

    try {
      setSubmitting(true);
      // Call the onUserCreated callback with form data
      await onUserCreated(formData);
    } catch (err) {
      alert(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft size={20} />
        <span>Back to Users</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Create New User</h2>
        <p className="text-gray-400">
          Fill in the details below to create a new user account.
        </p>
      </div>

      {/* Form */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
        <div className="space-y-6">
          {/* Full Name */}
          <FormField
            icon={<User size={20} />}
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter full name"
            required
            error={errors.fullName}
          />

          {/* Username */}
          <FormField
            icon={<User size={20} />}
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter username"
            required
            error={errors.username}
          />

          {/* Email */}
          <FormField
            icon={<Mail size={20} />}
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            required
            error={errors.email}
          />

          {/* Phone */}
          <FormField
            icon={<Phone size={20} />}
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number (optional)"
          />

          {/* Password */}
          <FormField
            icon={<Lock size={20} />}
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter password (min 6 characters)"
            required
            error={errors.password}
          />

          {/* Confirm Password */}
          <FormField
            icon={<Lock size={20} />}
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Re-enter password"
            required
            error={errors.confirmPassword}
          />

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center space-x-2">
              <Shield size={20} />
              <span>
                Role <span className="text-red-400">*</span>
              </span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={`w-full bg-zinc-800 border ${
                errors.role ? 'border-red-500' : 'border-zinc-700'
              } rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition`}
            >
              <option value="User">User</option>
              <option value="Chef">Chef</option>
              <option value="Admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-red-400 text-sm mt-1">{errors.role}</p>
            )}
            {formData.role === 'Chef' && (
              <p className="text-yellow-400 text-sm mt-2">
                Note: After creating a Chef user, you'll be redirected to complete the chef profile.
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-zinc-800">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            <span>{submitting ? 'Creating User...' : 'Create User'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ icon, label, name, type = 'text', value, onChange, placeholder, required = false, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center space-x-2">
        {icon}
        <span>
          {label} {required && <span className="text-red-400">*</span>}
        </span>
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-zinc-800 border ${
            error ? 'border-red-500' : 'border-zinc-700'
          } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition`}
        />
      </div>
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

export default CreateUserPage;