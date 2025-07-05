'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { SystemDesignCanvas } from '@/components/SystemDesignCanvas';
import systemDesignData from './system-design-components.json';
import { analyzeSystemRequest, SystemComponent, ComponentGroup, AIRecommendation, AIResponse } from '@/lib/ai';
import ChatSidebar from '@/components/ChatSidebar';
import { MessageCircle, X, PanelRight, PanelLeft } from 'lucide-react';
import { SignedIn, UserButton } from '@clerk/nextjs';

export default function Home() {
  const [groups, setGroups] = useState<ComponentGroup[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [systemDesignTitle, setSystemDesignTitle] = useState<string | null>(null);

  useEffect(() => {
    // Trigger resize for React Flow when sidebar toggles
    window.dispatchEvent(new Event('resize'));
  }, [sidebarOpen]);

  // Load all components from JSON on mount
  useEffect(() => {
    console.log('Page mounted, groups:', groups);
  }, [groups]);

  const handleSystemRequest = async (request: string): Promise<AIResponse> => {
    console.log('Handling system request:', request);
    setIsLoading(true);
    setExplanation(undefined);
    try {
      const allComponents: SystemComponent[] = systemDesignData.components;
      console.log('Available components count:', allComponents.length);

      const aiResult = await analyzeSystemRequest(request, allComponents);
      // If system design, update canvas
      if (aiResult.isSystemDesign && aiResult.recommendation) {
        setGroups(aiResult.recommendation.groups);
        setConnections(aiResult.recommendation.connections || []);
        setExplanation(aiResult.recommendation.explanation);
        setSystemDesignTitle(aiResult.recommendation.title || null); // Use the AI response title
      }
      return aiResult;
    } catch (error) {
      console.error('Error in handleSystemRequest:', error);
      setExplanation('Sorry, I could not analyze your request. Please try again.');
      return {
        message: 'Sorry, I could not analyze your request. Please try again.',
        isSystemDesign: false
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* User profile in top-right corner */}
      <div className="fixed top-6 right-6 z-50">
        <SignedIn>
          <UserButton />
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
        <SystemDesignCanvas groups={groups} connections={connections} systemDesignTitle={systemDesignTitle} />
      </div>
    </div>
  );
}