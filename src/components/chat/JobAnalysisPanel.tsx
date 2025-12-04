'use client';

import React, { useState } from 'react';
import { X, Briefcase, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JobAnalysisPanelProps {
  isExpanded: boolean;
  onToggle: () => void;
  onSubmit: (jobDescription: string) => void;
  isLoading?: boolean;
  hasResults?: boolean;
  children?: React.ReactNode; // For displaying JobAnalysisDisplay results
}

export const JobAnalysisPanel: React.FC<JobAnalysisPanelProps> = ({
  isExpanded,
  onToggle,
  onSubmit,
  isLoading = false,
  hasResults = false,
  children,
}) => {
  const [jobInput, setJobInput] = useState('');

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
      onToggle();
    }
  };

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed bottom-0 left-0 right-0 z-[290] bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"
        >
          <div className="max-h-[70vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {hasResults ? 'Job Match Analysis' : 'Analyze Job Match'}
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {hasResults ? 'Review your match results below' : 'Paste a job description or URL to analyze your fit'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasResults ? (
                  <ChevronDown className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                ) : (
                  <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {hasResults ? (
                // Display results
                <div>{children}</div>
              ) : (
                // Input form
                <form onSubmit={handleSubmit}>
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
                      rows={8}
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
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};