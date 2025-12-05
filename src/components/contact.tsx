'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function Contact() {
  return (
    <div className="mx-auto mt-8 w-full">
      <div className="bg-accent w-full overflow-hidden rounded-3xl px-6 py-8 font-sans sm:px-10 md:px-16 md:py-12">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-foreground text-3xl font-semibold md:text-4xl">
            Contacts
          </h2>
        </div>

        {/* Email Section */}
        <div className="mt-8 flex flex-col md:mt-10">
          <div className="flex items-center gap-1 group">
            <span className="text-base font-medium text-blue-500 hover:underline sm:text-lg">
              your.email@example.com
            </span>
            <ChevronRight className="h-5 w-5 text-blue-500 transition-transform duration-300 group-hover:translate-x-1" />
          </div>

          {/* Social Links */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-5 sm:gap-x-8">
            {/* Add your links here */}
            {/* <a href="https://twitter.com" className="text-sm text-blue-400 hover:underline">Twitter</a> */}
          </div>
        </div>
      </div>
    </div>
  );
}
