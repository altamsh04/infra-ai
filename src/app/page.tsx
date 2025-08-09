'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  // Image slider configuration
  const images = [
    {
      src: "/infra-ai-preview-1.png",
      alt: "Chat Application Design",
      title: "Chat Application"
    },
    {
      src: "/infra-ai-preview-2.png", 
      alt: "URL Shortener Design",
      title: "URL Shortener"
    },
    {
      src: "/infra-ai-preview-3.png",
      alt: "E-commerce Platform Design",
      title: "E-commerce Platform"
    }
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % images.length
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Handle modal open/close
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
      if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, images.length]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Clean decorative background shapes */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-400 to-blue-500 opacity-15 rounded-full blur-2xl z-0" />

      {/* Hero Content */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 py-16">
        <div className="mb-6">
          {/* Professional heading with subtle emphasis */}
          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-center">
            <span className="text-gray-800 font-light">AI-Powered</span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent font-bold">System Design,</span>
            <br />
            <span className="italic text-gray-800 font-black tracking-wide">Instantly</span>
          </h1>
        </div>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10 font-normal leading-relaxed">
          Describe your cloud or software architecture in natural language and let InfraAI generate, explain, and visualize your system in seconds.
        </p>
        
        {/* Illustration with Auto-sliding Images - Enhanced styling */}
        <div className="w-full flex justify-center mb-12">
          <div 
            className="relative w-[420px] h-[280px] md:w-[600px] md:h-[400px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:border-blue-300"
            onClick={openModal}
          >
            {/* Clean hover overlay */}
            <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/30 transition-all duration-300 z-20" />
            
            {/* Click to Expand Hint */}
            <div className="absolute top-4 right-4 bg-gray-900/80 text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
              Click to expand
            </div>

            {/* Image Slider */}
            <div className="relative w-full h-full flex items-center justify-center">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    index === currentImageIndex 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-95'
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-contain p-6"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
            
            {/* Clean image title overlay */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg z-30 shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                {images[currentImageIndex].title}
              </span>
            </div>
            
            {/* Clean slide indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'bg-blue-600 scale-110'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Clean progress bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 z-30">
              <div 
                className="h-full bg-blue-600 transition-all duration-100 ease-linear"
                style={{ 
                  width: `${((currentImageIndex + 1) / images.length) * 100}%` 
                }}
              />
            </div>
            
            <span className="absolute bottom-2 right-4 text-xs text-gray-400 font-semibold select-none z-30">
              InfraAI Preview ({currentImageIndex + 1}/{images.length})
            </span>
          </div>
        </div>

        {/* Professional CTA Button */}
        <Link
          href="/chat"
          className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          Get Started
        </Link>
      </section>

      {/* Modal Popup - Clean professional design */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4">
          <div className="relative w-full max-w-7xl h-full max-h-[95vh] bg-white rounded-lg sm:rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header - Clean */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 border-b border-gray-200 shrink-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                {images[currentImageIndex].title}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 shrink-0"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Clean */}
            <div className="relative bg-gray-50 flex-1 min-h-0">
              {/* Clean navigation arrows */}
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 sm:p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 sm:p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                aria-label="Next image"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Large Image Display */}
              <div className="relative w-full h-full">
                <Image
                  src={images[currentImageIndex].src}
                  alt={images[currentImageIndex].alt}
                  fill
                  className="object-contain p-2 sm:p-4 md:p-6 lg:p-8"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                  priority
                />
              </div>
            </div>

            {/* Modal Footer - Clean */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 border-t border-gray-200 shrink-0">
              {/* Clean slide indicators */}
              <div className="flex space-x-2 order-2 sm:order-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? 'bg-blue-600 scale-110'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              
              {/* Counter and Tips */}
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-right order-1 sm:order-2">
                <span className="font-medium">{currentImageIndex + 1} / {images.length}</span>
                <span className="hidden sm:inline ml-4 text-xs">Use ← → keys or click arrows to navigate</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}