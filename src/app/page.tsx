'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { SystemDesignCanvas } from '@/components/SystemDesignCanvas';
import systemDesignData from './system-design-components.json';
import { analyzeSystemRequest, SystemComponent, ComponentGroup, AIRecommendation, AIResponse } from '@/lib/ai';
import ChatSidebar from '@/components/ChatSidebar';
import { MessageCircle, X, PanelRight, PanelLeft, Coins, CreditCard } from 'lucide-react';
import { SignedIn, useUser } from '@clerk/nextjs';

export default function Home() {
  const [groups, setGroups] = useState<ComponentGroup[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [systemDesignTitle, setSystemDesignTitle] = useState<string | null>(null);
  const { isSignedIn, user } = useUser();
  const [creditError, setCreditError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const creditsRef = useRef<number | null>(null);

  useEffect(() => {
    // Trigger resize for React Flow when sidebar toggles
    window.dispatchEvent(new Event('resize'));
  }, [sidebarOpen]);

  // Load all components from JSON on mount
  useEffect(() => {
    console.log('Page mounted, groups:', groups);
  }, [groups]);

  const handleSystemRequest = async (request: string): Promise<AIResponse> => {
    setCreditError(null);
    if (!isSignedIn) {
      return {
        message: 'Please sign in to use system design features.',
        isSystemDesign: false,
      };
    }
    setIsLoading(true);
    setExplanation(undefined);
    try {
      const res = await fetch('/api/system-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request }),
      });
      const data = await res.json();
      if (typeof data.credits === 'number') {
        setCredits(data.credits);
        creditsRef.current = data.credits;
      }
      if (!res.ok) {
        if (data.error && data.error.includes('credits')) {
          setCreditError(data.error);
        }
        return {
          message: data.error || 'Sorry, could not process your request.',
          isSystemDesign: false,
        };
      }
      // Integrate actual AI response here
      if (data.isSystemDesign && data.recommendation) {
        setGroups(data.recommendation.groups);
        setConnections(data.recommendation.connections || []);
        setExplanation(data.recommendation.explanation);
        setSystemDesignTitle(data.recommendation.title || null);
      }
      return {
        message: data.message || 'System design request allowed.',
        isSystemDesign: !!data.isSystemDesign,
      };
    } catch (error) {
      setCreditError('Sorry, there was a problem processing your request.');
      return {
        message: 'Sorry, there was a problem processing your request.',
        isSystemDesign: false,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch credits on mount and when user logs in
  useEffect(() => {
    const fetchCredits = async () => {
      if (!isSignedIn) return;
      const res = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (typeof data.credits === 'number') {
        setCredits(data.credits);
        creditsRef.current = data.credits;
      }
    };
    fetchCredits();
  }, [isSignedIn, user?.id]);

  const handleBuyCreditsClick = () => {
    setShowPricingModal(true);
  };

  const closePricingModal = () => {
    setShowPricingModal(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* User profile in top-right corner */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <SignedIn>
          {typeof credits === 'number' && (
            <div className="flex items-center gap-2">
              {/* Credits Badge */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 shadow-lg backdrop-blur-sm transition-all duration-200 ${
                  credits === 0 
                    ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200 shadow-red-100' 
                    : 'bg-gradient-to-r from-green-50 to-emerald-100 text-green-800 border-green-200 shadow-green-100'
                }`}
              >
                <Coins className={`w-4 h-4 ${credits === 0 ? 'text-red-600' : 'text-green-600'}`} />
                <span>Credits: {credits}</span>
              </div>
              
              {/* Buy Credits Button - only show when credits are 0 */}
              {credits === 0 && (
                <button
                  onClick={handleBuyCreditsClick}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 border-2 border-blue-400"
                >
                  <CreditCard className="w-4 h-4" />
                  Buy Credits
                </button>
              )}
            </div>
          )}
        </SignedIn>
      </div>

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={closePricingModal}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full transform scale-100 transition-all duration-200">
            {/* Close Button */}
            <button
              onClick={closePricingModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Modal Content */}
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Pricing Soon
                </h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  We're working hard to bring you flexible pricing options. 
                  Stay tuned for updates on our credit packages!
                </p>
              </div>
              
              {/* Action Button */}
              <button
                onClick={closePricingModal}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Sidebar (toggleable) */}
      <div style={{ width: sidebarOpen ? 420 : 0, maxWidth: '95vw', transition: 'width 0.3s' }}>
        <ChatSidebar
          open={sidebarOpen}
          onSystemRequest={handleSystemRequest}
          isLoading={isLoading}
          explanation={explanation}
        />
      </div>
      {/* Right: Canvas */}
      <div className="flex-1 h-full bg-gray-50 transition-all duration-300 relative">
        {/* Toggle Button (never overlays sidebar) */}
        <button
          className="fixed top-3 z-50 bg-gray-100 text-gray-600 p-3 rounded-full shadow-lg hover:bg-gray-200 transition cursor-pointer flex items-center gap-2"
          style={{
            left: sidebarOpen ? 420 + 24 : 24,
            transition: 'left 0.3s',
          }}
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label={sidebarOpen ? "Close chat" : "Open chat"}
        >
          {sidebarOpen ? <PanelLeft className="w-6 h-6" /> : <PanelRight className="w-6 h-6" />}
          {/* <span className="ml-2 font-semibold text-base text-gray-700 select-none">InfraAI</span> */}
        </button>
        {creditError && (
          <div className="fixed top-20 right-6 z-50 bg-red-100 text-red-700 px-4 py-2 rounded shadow">
            {creditError}
          </div>
        )}
        <SystemDesignCanvas 
          groups={groups} 
          connections={connections} 
          systemDesignTitle={systemDesignTitle} 
          credits={credits}
          onImportDesign={(imported) => {
            if (imported.groups && Array.isArray(imported.groups)) setGroups(imported.groups);
            if (imported.connections && Array.isArray(imported.connections)) setConnections(imported.connections);
            if ('systemDesignTitle' in imported) setSystemDesignTitle(imported.systemDesignTitle);
          }}
        />
      </div>
    </div>
  );
}