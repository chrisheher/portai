'use client';

import React from 'react';
import { X } from 'lucide-react';

interface JobAnalysisPopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function JobAnalysisPopup({ isOpen, onClose, children }: JobAnalysisPopupProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={onClose}
      />
      
      {/* Centered popup */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2">
        <div 
          className="bg-[#584d3d] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with X button */}
          <div className="flex items-center border-none justify-between p-1 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-white"></h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close popup"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          
          {/* Content with scroll */}
          <div className="overflow-y-auto border-none max-h-[calc(90vh-88px)]">
            <div className="p-6 border-none">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}