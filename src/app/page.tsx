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
    const handleKeyDown = (e) => {
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-blue-400 to-purple-400 opacity-20 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-300 to-blue-200 opacity-30 rounded-full blur-2xl z-0" />

      {/* Hero Content */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 py-16">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-700 via-purple-700 to-blue-500 bg-clip-text text-transparent drop-shadow-lg mb-6">
          AI-Powered System Design, Instantly
        </h1>
        <p className="text-lg md:text-2xl text-gray-700 max-w-2xl mb-10 font-medium">
          Describe your cloud or software architecture in natural language and let InfraAI generate, explain, and visualize your system in seconds.
        </p>
        
        {/* Illustration with Auto-sliding Images - Larger Size */}
        <div className="w-full flex justify-center mb-12">
          <div 
            className="relative w-[420px] h-[280px] md:w-[600px] md:h-[400px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-2xl border-4 border-white overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-3xl"
            onClick={openModal}
          >
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 z-20" />
            
            {/* Click to Expand Hint */}
            <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
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
            
            {/* Image Title Overlay */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full z-30">
              <span className="text-sm font-semibold text-gray-700">
                {images[currentImageIndex].title}
              </span>
            </div>
            
            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
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
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 z-30">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100 ease-linear"
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

        {/* CTA Button */}
        <Link
          href="/chat"
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Get Started
        </Link>
      </section>

      {/* Modal Popup - Fully Responsive */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
          <div className="relative w-full max-w-7xl h-full max-h-[95vh] bg-white rounded-lg sm:rounded-2xl shadow-3xl overflow-hidden flex flex-col">
            {/* Modal Header - Responsive */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                {images[currentImageIndex].title}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200 shrink-0"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Flexible Height */}
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 flex-1 min-h-0">
              {/* Navigation Arrows - Responsive positioning */}
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 sm:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 sm:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Next image"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Large Image Display - Fully Responsive */}
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

            {/* Modal Footer - Responsive */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t shrink-0">
              {/* Slide Indicators */}
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
              
              {/* Counter and Tips - Responsive text */}
              <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-right order-1 sm:order-2">
                <span className="font-semibold">{currentImageIndex + 1} / {images.length}</span>
                <span className="hidden sm:inline ml-4 text-xs">Use ← → keys or click arrows to navigate</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}