'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, SignIn, UserButton } from '@clerk/nextjs';
import { DesignPrompt } from './DesignPrompts';
import { AIResponse } from '@/lib/ai';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isSystemDesign?: boolean;
  showDesignPrompts?: boolean; // New field to indicate if this message should show design prompts
}

interface ChatInterfaceProps {
  onSystemRequest: (request: string) => Promise<AIResponse>;
  isLoading: boolean;
  explanation?: string;
}

// Typing animation component for AI responses
function TypingMessage({ content, onDone }: { content: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    indexRef.current = 0;
    if (!content) return;
    const interval = setInterval(() => {
      setDisplayed((prev) => {
        const next = content.slice(0, indexRef.current + 1);
        if (next.length === content.length) {
          clearInterval(interval);
          if (onDone) onDone();
        }
        indexRef.current++;
        return next;
      });
    }, 12); // Adjust speed here (ms per character)
    return () => clearInterval(interval);
  }, [content, onDone]);

  return <span>{displayed}</span>;
}

export function ChatInterface({
  onSystemRequest,
  isLoading,
  explanation
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm InfraAI, developed by Altamsh Bairagdar. I'm your AI assistant specializing in system design and architecture. I can help you:\n\n• Design scalable system architectures\n• Choose the right components for your needs\n• Create visual system diagrams\n• Answer questions about technology and engineering\n• Have general conversations about tech topics\n\nTry one of these popular system design examples 👉",
      role: 'assistant',
      timestamp: new Date(),
      isSystemDesign: false,
      showDesignPrompts: true, // Enable design prompts for the first message
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useUser();
  const [showSignIn, setShowSignIn] = useState(false);
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  // Character limit constant
  const MAX_CHARACTERS = 500;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePromptSelect = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading || inputValue.length > MAX_CHARACTERS) return;
    if (!isSignedIn) {
      setShowSignIn(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    try {
      const aiResponse = await onSystemRequest(currentInput);
      const newId = (Date.now() + 1).toString();
      setAnimatingId(newId);
      // Add AI response to messages
      setMessages(prev => [
        ...prev,
        {
          id: newId,
          content: aiResponse.message,
          role: 'assistant',
          timestamp: new Date(),
          isSystemDesign: aiResponse.isSystemDesign,
        },
      ]);
    } catch (error) {
      console.error('Error during AI request:', error);

      let errorMessage = 'I apologize, but I encountered an error. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'It looks like there\'s an issue with the API configuration. Please check the API key setup.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'I\'m having trouble connecting right now. Please check your internet connection and try again.';
        }
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: errorMessage,
          role: 'assistant',
          timestamp: new Date(),
          isSystemDesign: false,
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Character count and validation
  const characterCount = inputValue.length;
  const isOverLimit = characterCount > MAX_CHARACTERS;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 border-r border-gray-200 shadow-2xl overflow-hidden" style={{ width: 420, maxWidth: '95vw' }}>
      {/* Header */}
      {/* <div className="px-6 py-4 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">AI Assistant</h2>
              <p className="text-sm text-gray-500">System Design & Chat</p>
            </div>
          </div>
          {isSignedIn && (
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          )}
        </div>
      </div> */}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-transparent scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {messages.map((message, idx) => {
          const isLatestAssistant =
            message.role === 'assistant' &&
            idx === messages.length - 1 &&
            message.id === animatingId;
          return (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 items-start',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={cn(
                "flex flex-col gap-1",
                message.showDesignPrompts ? "max-w-[95%]" : "max-w-[80%]"
              )}>
                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 shadow-sm border',
                    message.role === 'user'
                      ? 'bg-blue-600 text-white border-blue-500 rounded-br-md self-end'
                      : message.isSystemDesign
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 text-gray-900 border-green-200 rounded-bl-md'
                        : 'bg-white text-gray-900 border-gray-200 rounded-bl-md'
                  )}
                >
                  <p className="text-[15px] whitespace-pre-wrap leading-relaxed">
                    {isLatestAssistant ? (
                      <TypingMessage content={message.content} onDone={() => setAnimatingId(null)} />
                    ) : (
                      message.content
                    )}
                  </p>
                  {message.isSystemDesign && (
                    <div className="mt-2 text-xs text-green-700 font-medium">
                      🏗️ System Design Generated
                    </div>
                  )}
                </div>
                
                {/* Render Design Prompts if this message should show them */}
                {message.showDesignPrompts && (
                  <div className="mt-3 w-full max-w-full">
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          "Design a highly scalable URL shortener like bit.ly that can handle 100M URLs per day with Redis caching, database sharding, custom domains, analytics, and rate limiting",
                          "Build a distributed e-commerce system supporting 1M+ products with inventory management, payment processing, order fulfillment, recommendation engine, and real-time notifications",
                          "Create a real-time chat application like WhatsApp with message delivery, group chats, file sharing, end-to-end encryption, offline support, and push notifications for 10M+ users"
                        ].map((prompt, index) => (
                          <button
                            key={index}
                            onClick={() => handlePromptSelect(prompt)}
                            className="relative text-left p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 text-sm text-gray-700 hover:text-gray-900 group cursor-pointer"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 pr-6">
                                <div className="font-medium text-xs text-blue-600 mb-1">
                                  System Design {index + 1}
                                </div>
                                <div className="line-clamp-2 text-xs leading-relaxed">
                                  {prompt.length > 100 ? prompt.substring(0, 100) + "..." : prompt}
                                </div>
                              </div>
                              <div className="absolute top-2 right-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                                <Send className="w-3 h-3 text-blue-600" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <p className={cn(
                  'text-xs px-1',
                  message.role === 'user' ? 'text-gray-400 text-right' : 'text-gray-400 text-left'
                )}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-start justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200 rounded-bl-md flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-[15px] text-gray-600">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 z-10 px-6 pt-4 pb-2 bg-white/95 backdrop-blur-sm">
        <style jsx>{`
          textarea::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="flex gap-3 items-end mb-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about system design..."
              className={cn(
                "w-full px-3 py-3 pr-12 rounded-2xl border bg-white text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent shadow-sm placeholder:text-gray-400 resize-none overflow-hidden",
                isOverLimit 
                  ? "border-red-300 focus:ring-red-400" 
                  : "border-gray-200 focus:ring-blue-400"
              )}
              disabled={isLoading}
              autoFocus
              rows={1}
              style={{
                height: '48px',
                minHeight: '48px',
                maxHeight: '128px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                marginBottom: '0px',
                paddingBottom: '12px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = '48px';
                const newHeight = Math.min(Math.max(target.scrollHeight, 48), 128);
                target.style.height = `${newHeight}px`;
                if (target.scrollHeight > 128) {
                  target.style.overflowY = 'auto';
                } else {
                  target.style.overflowY = 'hidden';
                }
              }}
            />
            {/* Character counter */}
            <div className="absolute bottom-1 right-3 text-xs font-medium">
              <span className={cn(
                "transition-colors duration-200",
                isOverLimit ? "text-red-500" : "text-gray-400"
              )}>
                {characterCount}/{MAX_CHARACTERS}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!inputValue.trim() || isLoading || isOverLimit}
            className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Warning message when over limit */}
        {isOverLimit && (
          <div className="mb-2 text-xs text-red-500 font-medium">
            Message is too long. Please reduce by {characterCount - MAX_CHARACTERS} characters.
          </div>
        )}

        {/* Footer text */}
        <p className="text-xs text-gray-500 text-left">
          InfraAI can make mistakes in design, Developed by <a href="https://www.github.com/altamsh04" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@altamsh04</a>
        </p>
      </div>

      {/* Sign In Modal */}
      {showSignIn && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 relative max-w-md w-full mx-4">
            <button
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              onClick={() => setShowSignIn(false)}
              style={{ zIndex: 10000 }}
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
            <div className="pt-4">
              <SignIn afterSignInUrl={typeof window !== 'undefined' ? window.location.href : '/'} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}