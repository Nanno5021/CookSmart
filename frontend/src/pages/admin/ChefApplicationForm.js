import React, { useState } from 'react';
import { ArrowLeft, Award, Calendar, FileText, Link as LinkIcon, Briefcase, Save, Upload } from 'lucide-react';

function ChefApplicationForm({ user, onBack, onSubmit }) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    specialtyCuisine: '',
    yearsOfExperience: 0,
    certificationName: '',
    certificationImage: null, // Changed from certificationImageUrl to certificationImage
    portfolioLink: '',
    biography: '',
  });

  const [errors, setErrors] = useState({});
  const [uploadingCert, setUploadingCert] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.specialtyCuisine.trim()) {
      newErrors.specialtyCuisine = 'Specialty cuisine is required';
    }

    if (!formData.yearsOfExperience || formData.yearsOfExperience < 0) {
      newErrors.yearsOfExperience = 'Years of experience must be a positive number';
    }

    if (!formData.biography.trim()) {
      newErrors.biography = 'Biography is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
      alert('Chef profile created successfully!');
      onBack();
    } catch (err) {
      alert(err.message || 'Failed to create chef profile');
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
        <h2 className="text-3xl font-bold mb-2">Complete Chef Profile</h2>
        <p className="text-gray-400">
          You've changed <span className="text-white font-semibold">{user.fullName}</span>'s role to Chef. 
          Please complete the chef application details below.
        </p>
      </div>

      {/* Form */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
        <div className="space-y-6">
          {/* Specialty Cuisine */}
          <FormField
            icon={<Award size={20} />}
            label="Specialty Cuisine"
            name="specialtyCuisine"
            value={formData.specialtyCuisine}
            onChange={handleInputChange}
            placeholder="e.g., Italian, French, Japanese"
            required
            error={errors.specialtyCuisine}
          />

          {/* Years of Experience */}
          <FormField
            icon={<Calendar size={20} />}
            label="Years of Experience"
            name="yearsOfExperience"
            type="number"
            value={formData.yearsOfExperience}
            onChange={handleInputChange}
            placeholder="e.g., 5"
            required
            error={errors.yearsOfExperience}
          />

          {/* Certification Name */}
          <FormField
            icon={<Award size={20} />}
            label="Certification Name"
            name="certificationName"
            value={formData.certificationName}
            onChange={handleInputChange}
            placeholder="e.g., Culinary Arts Diploma (Optional)"
          />

          {/* Certification Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center space-x-2">
              <Upload size={20} />
              <span>Certification Image (Optional)</span>
            </label>
            <div className="relative">
              <input
                type="file"
                name="certificationImage"
                accept=".jpg,.jpeg,.png,.gif"
                onChange={handleInputChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600 transition"
              />
            </div>
            {formData.certificationImage && (
              <p className="text-green-400 text-sm mt-2">
                Selected file: {formData.certificationImage.name}
              </p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Accepted formats: JPG, PNG, GIF (Max 5MB)
            </p>
          </div>

          {/* Portfolio Link */}
          <FormField
            icon={<LinkIcon size={20} />}
            label="Portfolio Link"
            name="portfolioLink"
            value={formData.portfolioLink}
            onChange={handleInputChange}
            placeholder="https://example.com/portfolio (Optional)"
          />

          {/* Biography */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center space-x-2">
              <FileText size={20} />
              <span>Biography <span className="text-red-400">*</span></span>
            </label>
            <textarea
              name="biography"
              value={formData.biography}
              onChange={handleInputChange}
              placeholder="Tell us about your culinary journey, specialties, and experience..."
              rows={6}
              className={`w-full bg-zinc-800 border ${
                errors.biography ? 'border-red-500' : 'border-zinc-700'
              } rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition`}
            />
            {errors.biography && (
              <p className="text-red-400 text-sm mt-1">{errors.biography}</p>
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
            <span>{submitting ? 'Creating Profile...' : 'Create Chef Profile'}</span>
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

export default ChefApplicationForm;