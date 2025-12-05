'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { contactInfo } from '@/lib/config-loader';

export function Contact() {
  // Contact information now loaded from configuration

  // Function to handle opening links
  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
     

          {/* Social Links */}
        
          </div>
        </div>
     
    </div>
  );
}

export default Contact;
