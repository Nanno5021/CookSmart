import React, { useState, useEffect } from 'react';
import {getApplicationById,approveApplication,rejectApplication,} from '../../api/chefApproval';
import {
  ArrowLeft,
  User,
  Mail,
  Award,
  Calendar,
  FileText,
  Link as LinkIcon,
  Briefcase,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  X,
} from 'lucide-react';

function ApplicationDetails({ applicationId, onBack }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog States
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  // Image Modal State
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    loadApplicationDetails();
  }, [applicationId]);

  const loadApplicationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getApplicationById(applicationId);
      setApplication(data);
    } catch (err) {
      setError(err.message || 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  // --- APPROVE ---
  const performApprove = async () => {
    try {
      setActionLoading(true);
      await approveApplication(applicationId);
      setApplication({ ...application, Status: 'Approved' });
      setShowApproveDialog(false);
      alert('Chef approved successfully!');
    } catch (err) {
      alert(err.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  // --- REJECT ---
  const performReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }
    try {
      setActionLoading(true);
      await rejectApplication(applicationId, rejectReason);
      setApplication({ ...application, Status: 'Rejected', AdminRemarks: rejectReason });
      setShowRejectDialog(false);
      setRejectReason('');
      alert('Chef rejected successfully!');
    } catch (err) {
      alert(err.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <BackButton onClick={onBack} />
        <h2 className="text-3xl font-bold mb-8">Application Details</h2>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <BackButton onClick={onBack} />
        <h2 className="text-3xl font-bold mb-8">Application Details</h2>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadApplicationDetails}
            className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6">
        <BackButton onClick={onBack} />
        <h2 className="text-3xl font-bold mb-8">Application Details</h2>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-gray-400">Application not found</p>
        </div>
      </div>
    );
  }

  const certImageUrl = application.CertificationImageUrl 
    ? `${application.CertificationImageUrl}` 
    : null;

  return (
    <div className="p-6">
      <BackButton onClick={onBack} />
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Application Details</h2>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            application.Status === 'Pending'
              ? 'bg-yellow-500 bg-opacity-20 text-yellow-500'
              : application.Status === 'Approved'
              ? 'bg-green-500 bg-opacity-20 text-green-500'
              : 'bg-red-500 bg-opacity-20 text-red-500'
          }`}
        >
          {application.Status}
        </span>
      </div>

      {/* Action Buttons - Only for Pending */}
      {application.Status === 'Pending' && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowApproveDialog(true)}
            disabled={actionLoading}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
          >
            <CheckCircle size={18} />
            Approve
          </button>

          <button
            onClick={() => setShowRejectDialog(true)}
            disabled={actionLoading}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <XCircle size={18} />
            Reject
          </button>
        </div>
      )}

      {/* Application Content */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="p-8 space-y-6">
          <Section title="Personal Information" icon={User}>
            <FormField label="Full Name" value={application.FullName} icon={User} />
            <FormField label="Email" value={application.Email} icon={Mail} />
          </Section>

          <Divider />

          <Section title="Professional Information" icon={Briefcase}>
            <FormField label="Specialty Cuisine" value={application.SpecialtyCuisine} icon={Award} />
            <FormField
              label="Years of Experience"
              value={`${application.YearsOfExperience} years`}
              icon={Calendar}
            />
            <FormField
              label="Certification Name"
              value={application.CertificationName || 'N/A'}
              icon={Award}
            />
            <FormField
              label="Portfolio Link"
              value={application.PortfolioLink || 'N/A'}
              icon={LinkIcon}
              isLink={!!application.PortfolioLink}
            />
          </Section>

          <Divider />

          {/* Certification Image Section */}
          {certImageUrl && (
            <>
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <ImageIcon size={24} className="text-orange-500" />
                  <span>Certification Image</span>
                </h3>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <div className="relative inline-block">
                    <img
                      src={certImageUrl}
                      alt="Certification"
                      className="max-w-full h-auto rounded-lg border-2 border-zinc-700 cursor-pointer hover:border-orange-500 transition"
                      style={{ maxHeight: '300px' }}
                      onClick={() => setShowImageModal(true)}
                    />
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="absolute bottom-2 right-2 px-3 py-1 bg-black bg-opacity-70 text-white rounded text-sm hover:bg-opacity-90 transition"
                    >
                      View Full Size
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Click to view full size</p>
                </div>
              </div>

              <Divider />
            </>
          )}

          <Section title="Biography" icon={FileText}>
            <div className="bg-zinc-800 rounded-lg p-4 col-span-2">
              <p className="text-gray-300 whitespace-pre-wrap">
                {application.Biography || 'No biography provided'}
              </p>
            </div>
          </Section>

          <Divider />

          <Section title="Application Timeline" icon={Calendar}>
            <FormField
              label="Date Applied"
              value={new Date(application.DateApplied).toLocaleDateString()}
              icon={Calendar}
            />
            {application.DateReviewed && (
              <FormField
                label="Date Reviewed"
                value={new Date(application.DateReviewed).toLocaleDateString()}
                icon={Calendar}
              />
            )}
          </Section>

          {application.Status === 'Rejected' && application.AdminRemarks && (
            <>
              <Divider />
              <div>
                <h3 className="text-xl font-bold mb-4 text-red-400">Rejection Remarks</h3>
                <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4">
                  <p className="text-gray-300">{application.AdminRemarks}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ---------- IMAGE MODAL ---------- */}
      {showImageModal && certImageUrl && (
        <ImageModal imageUrl={certImageUrl} onClose={() => setShowImageModal(false)} />
      )}

      {/* ---------- APPROVE DIALOG ---------- */}
      {showApproveDialog && (
        <Modal onClose={() => setShowApproveDialog(false)}>
          <h3 className="text-xl font-bold mb-4">Approve Application</h3>
          <p className="text-gray-400 mb-6">
            Are you sure you want to approve this chef?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowApproveDialog(false)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={performApprove}
              disabled={actionLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
            >
              {actionLoading ? 'Approving…' : 'Yes, Approve'}
            </button>
          </div>
        </Modal>
      )}

      {/* ---------- REJECT DIALOG ---------- */}
      {showRejectDialog && (
        <Modal onClose={() => setShowRejectDialog(false)}>
          <h3 className="text-xl font-bold mb-4">Reject Application</h3>
          <p className="text-gray-400 mb-4">
            Please provide a reason for rejection (this will be shown to the chef).
          </p>
          <textarea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition"
          />
          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={() => setShowRejectDialog(false)}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={performReject}
              disabled={actionLoading || !rejectReason.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
            >
              {actionLoading ? 'Submitting…' : 'Reject'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
    >
      <ArrowLeft size={20} />
      <span>Back to Applications</span>
    </button>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
        <Icon size={24} className="text-orange-500" />
        <span>{title}</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-zinc-800"></div>;
}

function FormField({ label, value, icon: Icon, isLink = false }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400 font-medium">{label}</label>
      <div className="flex items-center space-x-3 bg-zinc-800 rounded-lg p-3">
        {Icon && <Icon size={18} className="text-gray-500" />}
        {isLink && value !== 'N/A' ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300 underline"
          >
            {value}
          </a>
        ) : (
          <span className="text-white">{value}</span>
        )}
      </div>
    </div>
  );
}

function ImageModal({ imageUrl, onClose }) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-5xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
        >
          <X size={24} />
        </button>
        <img
          src={imageUrl}
          alt="Certification Full Size"
          className="max-w-full max-h-[90vh] rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
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

export default ApplicationDetails;