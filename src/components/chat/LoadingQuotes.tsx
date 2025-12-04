// src/components/chat/LoadingQuotes.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const quotes = [
  {
    text: "The best way to predict the future is to invent it.",
    author: "Alan Kay"
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House"
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson"
  },
  {
    text: "Experience is the name everyone gives to their mistakes.",
    author: "Oscar Wilde"
  },
  {
    text: "In order to be irreplaceable, one must always be different.",
    author: "Coco Chanel"
  },
  {
    text: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman"
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck"
  },
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson"
  }
];

export const LoadingQuotes: React.FC = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000); // Change quote every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="max-w-2xl px-8">
        {/* Animated spinner */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
        </div>

        {/* Rotating quotes */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuoteIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="text-xl md:text-2xl text-white font-light italic mb-4">
              "{quotes[currentQuoteIndex].text}"
            </p>
            <p className="text-sm md:text-base text-white/70">
              — {quotes[currentQuoteIndex].author}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Loading text */}
        <div className="mt-8 text-center">
          <p className="text-white/80 text-sm">
            Analyzing<span className="animate-pulse">...</span>
          </p>
        </div>
      </div>
    </div>
  );
};