'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { SystemDesignCanvas } from '@/components/SystemDesignCanvas';
import systemDesignData from './system-design-components.json';
import { analyzeSystemRequest, SystemComponent, ComponentGroup, AIRecommendation } from '@/lib/ai';

export default function Home() {
  const [groups, setGroups] = useState<ComponentGroup[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | undefined>(undefined);

  // Load all components from JSON on mount
  useEffect(() => {
    console.log('Page mounted, groups:', groups);
  }, [groups]);

  const handleSystemRequest = async (request: string) => {
    console.log('Handling system request:', request);
    setIsLoading(true);
    setExplanation(undefined);
    try {
      const allComponents: SystemComponent[] = systemDesignData.components;
      console.log('Available components count:', allComponents.length);
      
      const aiResult: AIRecommendation = await analyzeSystemRequest(request, allComponents);
      console.log('AI result:', aiResult);
      
      setGroups(aiResult.groups);
      setConnections(aiResult.connections || []);
      setExplanation(aiResult.explanation);
    } catch (error) {
      console.error('Error in handleSystemRequest:', error);
      setExplanation('Sorry, I could not analyze your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left: Chat */}
      <div className="w-full max-w-md h-full border-r border-gray-200 bg-white flex flex-col">
        <ChatInterface
          onSystemRequest={handleSystemRequest}
          isLoading={isLoading}
          explanation={explanation}
        />
      </div>
      {/* Right: Canvas */}
      <div className="flex-1 h-full bg-gray-50">
        <SystemDesignCanvas groups={groups} connections={connections} />
      </div>
    </div>
  );
}
