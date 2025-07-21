'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
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
        {/* Illustration Placeholder */}
        <div className="w-full flex justify-center mb-12">
          <div className="relative w-[340px] h-[220px] md:w-[480px] md:h-[300px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-2xl border-4 border-white flex items-center justify-center">
            {/* Abstract SVG or App Screenshot Placeholder */}
            <svg width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="20" width="160" height="80" rx="18" fill="#e0e7ff" />
              <rect x="30" y="40" width="40" height="40" rx="8" fill="#a5b4fc" />
              <rect x="110" y="40" width="40" height="40" rx="8" fill="#c4b5fd" />
              <rect x="70" y="60" width="40" height="20" rx="6" fill="#818cf8" />
              <circle cx="90" cy="40" r="8" fill="#6366f1" />
              <circle cx="90" cy="100" r="6" fill="#a5b4fc" />
              <rect x="80" y="90" width="20" height="8" rx="3" fill="#c7d2fe" />
            </svg>
            <span className="absolute bottom-2 right-4 text-xs text-gray-400 font-semibold select-none">InfraAI Preview</span>
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
    </main>
  );
}