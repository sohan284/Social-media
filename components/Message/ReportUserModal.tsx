"use client";

import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { useReportUserMutation } from '@/store/chatApi';
import { toast } from 'sonner';

interface ReportUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | string;
  username: string;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'fake_account', label: 'Fake Account' },
  { value: 'other', label: 'Other' },
] as const;

const ReportUserModal = ({ isOpen, onClose, userId, username }: ReportUserModalProps) => {
  const [reason, setReason] = useState<'spam' | 'harassment' | 'inappropriate_content' | 'fake_account' | 'other'>('spam');
  const [description, setDescription] = useState('');
  const [reportUser, { isLoading }] = useReportUserMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    try {
      await reportUser({
        reported_user: userId,
        reason,
        description: description.trim() || undefined,
      }).unwrap();

      toast.success('User has been reported. Our team will review this report.');
      setReason('spam');
      setDescription('');
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { error?: string; message?: string } };
      toast.error(err?.data?.error || err?.data?.message || 'Failed to report user');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#06133f] rounded-lg shadow-2xl w-full max-w-md mx-4 border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Report User</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors text-white"
            disabled={isLoading}
          >
            <AiOutlineClose size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-3">
              Reporting: <span className="text-white font-medium">{username}</span>
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Please select a reason for reporting this user. Our team will review your report.
            </p>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center p-3 rounded-lg border border-gray-700 hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={(e) => setReason(e.target.value as typeof reason)}
                    className="mr-3 w-4 h-4 text-[#0059ff] focus:ring-[#0059ff] focus:ring-2"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-white">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional information that might help us review this report..."
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0059ff] focus:border-transparent text-sm text-white resize-none custom-scroll"
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
              ) : (
                'Report User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportUserModal;

