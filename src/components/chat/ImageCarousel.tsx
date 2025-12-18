'use client';

import React, { useState } from 'react';

interface Image {
  src: string;
  alt: string;
  url?: string;
}

interface ImageCarouselProps {
  images: Image[];
  title: string;
  description?: string;
    campaignTitle?: string;
  campaignListDescription?: string;
  impact?: { stat: string }[];
  onClose: () => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  title,
  description,
  campaignListDescription,
  campaignTitle,
  impact,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageClick = () => {
    if (images[currentIndex].url) {
      window.open(images[currentIndex].url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[601] bg-[#rgb(220, 211, 195)] flex">
      {/* LEFT HALF - Description & Impact */}
      <div className="w-1/2 h-full overflow-y-auto p-12 flex flex-col justify-center">
        <div className="max-w-xl mx-auto">
         {campaignTitle && (
            <p className="text-[#dcd3c3] text-lg leading-relaxed mb-8 italic">
              {campaignTitle}
            </p>
          )}

          {/* Campaign List Description */}
          {campaignListDescription && (
            <p className="text-[#dcd3c3] text-lg leading-relaxed mb-8 italic">
              {campaignListDescription}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="text-[#dcd3c3] text-base leading-relaxed mb-8">
              {description}
            </p>
          )}

          {/* Impact Stats */}
          {impact && impact.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[#dcd3c3] text-2xl font-semibold mb-4">Impact</h3>
              {impact.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#dcd3c3] mt-2 flex-shrink-0" />
                  <p className="text-[#dcd3c3] text-base leading-relaxed">
                    {item.stat}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="mt-8 px-6 py-3 bg-[#dcd3c3] text-[#5e4631] rounded-lg font-semibold hover:bg-[#ccc4b4] transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* RIGHT HALF - Carousel */}
      <div className="w-1/2 h-full flex items-center justify-center p-12">
        <div className="w-full max-w-2xl">
          {/* Carousel Container */}
          <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-2xl">
            {/* Main Image */}
            <div
              onClick={handleImageClick}
              className="w-full h-full flex items-center justify-center"
              style={{ cursor: images[currentIndex].url ? 'pointer' : 'default' }}
            >
              <img
                src={images[currentIndex].src}
                alt={images[currentIndex].alt}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-[rgba(94,70,49,0.8)] text-[#dcd3c3] w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-[rgba(94,70,49,0.95)] transition-all z-10"
                >
                  ‹
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-[rgba(94,70,49,0.8)] text-[#dcd3c3] w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-[rgba(94,70,49,0.95)] transition-all z-10"
                >
                  ›
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 right-4 bg-[rgba(94,70,49,0.8)] text-[#dcd3c3] px-4 py-2 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 mt-6 flex-wrap">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="w-16 h-16 rounded-lg overflow-hidden transition-all"
                  style={{
                    border: index === currentIndex ? '3px solid #dcd3c3' : '2px solid rgba(220,211,195,0.5)',
                    opacity: index === currentIndex ? 1 : 0.6
                  }}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Instagram link hint */}
          {images[currentIndex].url && (
            <p className="text-center text-[#dcd3c3] text-sm mt-4 italic">
              Click image to view on Instagram
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;