'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { SystemDesignCanvas } from '@/components/SystemDesignCanvas';
import systemDesignData from './system-design-components.json';
import { analyzeSystemRequest, SystemComponent, ComponentGroup, AIRecommendation, AIResponse } from '@/lib/ai';
import ChatSidebar from '@/components/ChatSidebar';
import { MessageCircle, X, PanelRight, PanelLeft } from 'lucide-react';
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

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* User profile in top-right corner */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <SignedIn>
          {typeof credits === 'number' && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border shadow-sm transition-colors duration-200 ${credits === 0 ? 'bg-red-100 text-gray-700 border-gray-300' : 'bg-green-100 text-gray-700 border-gray-300'}`}
              style={{ marginRight: 8 }}
            >
              Credits: {credits}
            </span>
          )}
        </SignedIn>
      </div>
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
          <span className="ml-2 font-semibold text-base text-gray-700 select-none">InfraAI</span>
        </button>
        {creditError && (
          <div className="fixed top-20 right-6 z-50 bg-red-100 text-red-700 px-4 py-2 rounded shadow">
            {creditError}
          </div>
        )}
        <SystemDesignCanvas groups={groups} connections={connections} systemDesignTitle={systemDesignTitle} credits={credits} />
      </div>
    </div>
  );
}