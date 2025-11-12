import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar, Shield, Ban, CheckCircle, Edit, Award, Briefcase, Star, ExternalLink } from 'lucide-react';
import { fetchUserById } from '../../api/manageUserApi';

function UserDetailsPage({ userId, onBack, onEdit }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserById(userId);
      setUser(data);
    } catch (err) {
      setError(err.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Users</span>
        </button>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-gray-400">Loading user details…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Users</span>
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

  if (!user) {
    return (
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Users</span>
        </button>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-gray-400">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Edit buttons */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Users</span>
        </button>
        
        <div className="flex items-center space-x-3">
          {user.role === 'Chef' && user.chefProfile && (
            <button
              onClick={() => onEdit(userId, 'chef')}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg transition inline-flex items-center space-x-2"
            >
              <Award size={18} />
              <span>Edit Chef Profile</span>
            </button>
          )}
          <button
            onClick={() => onEdit(userId, 'user')}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition inline-flex items-center space-x-2"
          >
            <Edit size={18} />
            <span>Edit User Profile</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center">
                <User size={40} className="text-gray-400" />
              </div>
            )}

            {/* User Info */}
            <div>
              <h2 className="text-3xl font-bold mb-2">{user.fullName}</h2>
              <p className="text-gray-400 mb-3">@{user.username}</p>
              
              {/* Status and Role Badges */}
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    user.role === 'Admin'
                      ? 'bg-purple-500 bg-opacity-20 text-purple-400'
                      : user.role === 'Chef'
                      ? 'bg-orange-500 bg-opacity-20 text-orange-400'
                      : 'bg-blue-500 bg-opacity-20 text-blue-400'
                  }`}
                >
                  {user.role}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    user.isBanned
                      ? 'bg-red-500 bg-opacity-20 text-red-400'
                      : 'bg-green-500 bg-opacity-20 text-green-400'
                  }`}
                >
                  {user.isBanned ? 'Banned' : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Contact Information */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Mail size={20} className="text-orange-500" />
            <span>Contact Information</span>
          </h3>
          
          <div className="space-y-4">
            <InfoRow icon={<Mail size={18} />} label="Email" value={user.email} />
            <InfoRow
              icon={<Phone size={18} />}
              label="Phone"
              value={user.phone || 'Not provided'}
            />
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Shield size={20} className="text-orange-500" />
            <span>Account Information</span>
          </h3>
          
          <div className="space-y-4">
            <InfoRow
              icon={<Calendar size={18} />}
              label="Join Date"
              value={new Date(user.joinDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
            <InfoRow
              icon={<Shield size={18} />}
              label="Role"
              value={user.role}
            />
            <InfoRow
              icon={user.isBanned ? <Ban size={18} /> : <CheckCircle size={18} />}
              label="Status"
              value={user.isBanned ? 'Banned' : 'Active'}
              valueClassName={user.isBanned ? 'text-red-400' : 'text-green-400'}
            />
          </div>
        </div>
      </div>

      {/* Chef Profile Section */}
      {user.role === 'Chef' && user.chefProfile && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
          <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
            <Award size={20} className="text-orange-500" />
            <span>Chef Profile</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chef Basic Info */}
            <div className="space-y-4">
              <InfoRow
                icon={<Award size={18} />}
                label="Specialty Cuisine"
                value={user.chefProfile.specialtyCuisine || 'Not specified'}
              />
              <InfoRow
                icon={<Calendar size={18} />}
                label="Years of Experience"
                value={user.chefProfile.yearsOfExperience || '0'}
              />
              <InfoRow
                icon={<Briefcase size={18} />}
                label="Certification"
                value={user.chefProfile.certificationName || 'Not specified'}
              />
            </div>

            {/* Chef Stats */}
            <div className="space-y-4">
              <InfoRow
                icon={<Star size={18} />}
                label="Rating"
                value={
                  <div className="flex items-center space-x-2">
                    <span>{user.chefProfile.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-gray-400 text-sm">
                      ({user.chefProfile.totalReviews || 0} reviews)
                    </span>
                  </div>
                }
              />
              <InfoRow
                icon={<Calendar size={18} />}
                label="Approved Date"
                value={new Date(user.chefProfile.approvedDate).toLocaleDateString()}
              />
              {user.chefProfile.portfolioLink && (
                <InfoRow
                  icon={<ExternalLink size={18} />}
                  label="Portfolio"
                  value={
                    <a 
                      href={user.chefProfile.portfolioLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:text-orange-400 transition"
                    >
                      View Portfolio
                    </a>
                  }
                />
              )}
            </div>
          </div>

          {/* Biography */}
          {user.chefProfile.biography && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <h4 className="text-lg font-semibold mb-3">Biography</h4>
              <p className="text-gray-400 leading-relaxed">{user.chefProfile.biography}</p>
            </div>
          )}

          {/* Certification Image */}
          {user.chefProfile.certificationImageUrl && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <h4 className="text-lg font-semibold mb-3">Certification</h4>
              <img 
                src={user.chefProfile.certificationImageUrl} 
                alt="Certification"
                className="max-w-md rounded-lg border border-zinc-700"
              />
            </div>
          )}
        </div>
      )}

      {/* Bio Section (if available) */}
      {user.bio && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Bio</h3>
          <p className="text-gray-400">{user.bio}</p>
        </div>
      )}

      {/* Activity Stats (if available) */}
      {(user.totalPosts || user.totalComments || user.totalViews) && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-xl font-bold mb-4">Activity Statistics</h3>
          <div className="grid grid-cols-3 gap-6">
            <StatCard label="Total Posts" value={user.totalPosts || 0} />
            <StatCard label="Total Comments" value={user.totalComments || 0} />
            <StatCard label="Total Views" value={user.totalViews || 0} />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value, valueClassName = 'text-white' }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="text-gray-400 mt-1">{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`font-medium ${valueClassName}`}>{value}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-zinc-800 rounded-lg p-4 text-center">
      <p className="text-3xl font-bold text-orange-500 mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

export default UserDetailsPage;