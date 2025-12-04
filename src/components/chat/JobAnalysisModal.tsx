'use client';

import React, { useState, useEffect } from 'react';
import { X, Briefcase, Loader2 } from 'lucide-react';

interface JobAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobDescription: string) => void;
  isLoading?: boolean;
}

export const JobAnalysisModal: React.FC<JobAnalysisModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [jobInput, setJobInput] = useState('');

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isLoading]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobInput.trim()) {
      onSubmit(jobInput.trim());
      setJobInput('');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setJobInput('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      {/* Backdrop - Remove onClick to prevent backdrop dismissal */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-[410] w-full max-w-2xl rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Analyze Job Match
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Paste a job description or URL to analyze your fit
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="job-description"
              className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Job Description or URL
            </label>
            <textarea
              id="job-description"
              value={jobInput}
              onChange={(e) => setJobInput(e.target.value)}
              placeholder="Paste the full job description or a URL to the job posting (e.g., LinkedIn, Indeed, company careers page)..."
              rows={12}
              disabled={isLoading}
              autoFocus
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              💡 Tip: You can paste a URL or the entire job description text
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!jobInput.trim() || isLoading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4" />
                  Analyze Match
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};