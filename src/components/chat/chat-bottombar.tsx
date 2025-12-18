// src/components/chat/chat-bottombar.tsx
'use client';

import { ChatRequestOptions } from 'ai';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ChatBottombarProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  isLoading: boolean;
  stop: () => void;
  input: string;
  setInput: (value: string) => void;
  isToolInProgress: boolean;
  countdown?: number | null;  // Add this to receive countdown from parent
}

export default function ChatBottombar({
  input = '',
  setInput,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  isToolInProgress,
  countdown = null,  // Receive countdown from parent
}: ChatBottombarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === 'Enter' &&
      !e.nativeEvent.isComposing &&
      !isToolInProgress &&
      input.trim()
    ) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, x: 400, y: -130 }}
      className="w-full pb-0 md:pb-12"
    >
      <form onSubmit={handleSubmit} className="fixed">
        <div className="flex rounded-full border border-[#E5E5E9] bg-[#dcd3c3]">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={
              isToolInProgress ? 'Tool is in progress...' : 'paste text, no links'
            }
            className="text-md w-64 border-none bg-transparent p-4 text-black placeholder:text-gray-500 focus:outline-none"
            disabled={isToolInProgress || isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || !(input?.trim()) || isToolInProgress}
            className="flex items-center justify-center rounded-full bg-[#0171E3] p-4 text-black disabled:opacity-50"
            onClick={(e) => {
              if (isLoading) {
                e.preventDefault();
                stop();
              }
            }}
          >
            <ArrowRight className="h-7 w-7" />
          </button>
        </div>
        
        {/* Countdown display */}
        {countdown !== null && countdown > 0 && (
          <div className="mt-2 text-center text-sm text-gray-600">
            Analyzing job... {countdown}s
          </div>
        )}
      </form>
    </motion.div>
  );
}