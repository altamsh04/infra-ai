'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, X, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, SignIn, UserButton } from '@clerk/nextjs';
import { AIResponse } from '@/lib/ai';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isSystemDesign?: boolean;
  showDesignPrompts?: boolean;
}

interface ChatInterfaceProps {
  onSystemRequest: (request: string) => Promise<AIResponse>;
  isLoading: boolean;
}

// Enhanced typing animation component with cursor effect
function TypingMessage({ content, onDone }: { content: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    indexRef.current = 0;
    if (!content) return;
    
    const interval = setInterval(() => {
      setDisplayed(() => {
        const next = content.slice(0, indexRef.current + 1);
        if (next.length === content.length) {
          clearInterval(interval);
          setTimeout(() => setShowCursor(false), 1000);
          if (onDone) onDone();
        }
        indexRef.current++;
        return next;
      });
    }, 8); // Slightly faster typing

    return () => clearInterval(interval);
  }, [content, onDone]);

  // Cursor blinking effect
  useEffect(() => {
    if (!showCursor) return;
    const cursorInterval = setInterval(() => {
      setShowCursor(showCursor => !showCursor);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, [showCursor]);

  return (
    <span className="relative">
      {displayed}
      {showCursor && displayed.length < content.length && (
        <span className="inline-block w-0.5 h-4 bg-blue-600 ml-1 animate-pulse" />
      )}
    </span>
  );
}

export function ChatInterface({
  onSystemRequest,
  isLoading
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm InfraAI, developed by Altamsh Bairagdar. I'm your AI assistant specializing in system design and architecture. I can help you:\n\n• Design scalable system architectures\n• Choose the right components for your needs\n• Create visual system diagrams\n• Answer questions about technology and engineering\n• Have general conversations about tech topics\n\nTry one of these popular system design examples 👉",
      role: 'assistant',
      timestamp: new Date(),
      isSystemDesign: false,
      showDesignPrompts: true,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isSignedIn } = useUser();
  const [showSignIn, setShowSignIn] = useState(false);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

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
    // Auto-resize textarea when prompt is selected
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 48), 128);
      textareaRef.current.style.height = `${newHeight}px`;
    }
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
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }

    try {
      const aiResponse = await onSystemRequest(currentInput);
      const newId = (Date.now() + 1).toString();
      setAnimatingId(newId);
      setIsTyping(false);
      
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
      setIsTyping(false);

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
      {/* Enhanced Header with status indicator */}
      <div className="px-6 py-4 border-b border-gray-200/80 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              {/* Status indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">InfraAI</h2>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>System Design & Chat</span>
              </div>
            </div> 
          </div>
          {isSignedIn && (
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 shadow-md border-2 border-blue-100"
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Enhanced Messages Container */}
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
                'flex gap-3 items-start animate-fadeIn',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
              style={{
                animationDelay: `${idx * 50}ms`,
                animationFillMode: 'both'
              }}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg mt-1 border-2 border-blue-100">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={cn(
                "flex flex-col gap-1",
                message.showDesignPrompts ? "max-w-[95%]" : "max-w-[80%]"
              )}>
                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 shadow-lg border backdrop-blur-sm transition-all duration-200 hover:shadow-xl',
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500 rounded-br-md self-end shadow-blue-200/50'
                      : message.isSystemDesign
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-gray-900 border-green-200 rounded-bl-md shadow-green-100/50'
                        : 'bg-white/90 text-gray-900 border-gray-200 rounded-bl-md shadow-gray-100/50'
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
                    <div className="mt-2 flex items-center gap-1 text-xs text-emerald-700 font-medium">
                      <Zap className="w-3 h-3" />
                      <span>System Design Generated</span>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Design Prompts */}
                {message.showDesignPrompts && (
                  <div className="mt-3 w-full max-w-full">
                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Popular System Designs
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          {
                            title: "URL Shortener",
                            prompt: "Design a highly scalable URL shortener like bit.ly that can handle 100M URLs per day with Redis caching, database sharding, custom domains, analytics, and rate limiting",
                          },
                          {
                            title: "E-commerce Platform",
                            prompt: "Build a distributed e-commerce system supporting 1M+ products with inventory management, payment processing, order fulfillment, recommendation engine, and real-time notifications",
                          },
                          {
                            title: "Chat Application",
                            prompt: "Create a real-time chat application like WhatsApp with message delivery, group chats, file sharing, end-to-end encryption, offline support, and push notifications for 10M+ users",
                          }
                        ].map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handlePromptSelect(item.prompt)}
                            className="relative text-left p-3 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-200 text-sm text-gray-700 hover:text-gray-900 group cursor-pointer shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 pr-6">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs text-blue-700">
                                      {item.title}
                                    </span>
                                  </div>
                                </div>
                                <div className="line-clamp-2 text-xs leading-relaxed text-gray-600">
                                  {item.prompt.length > 120 ? item.prompt.substring(0, 120) + "..." : item.prompt}
                                </div>
                              </div>
                              <div className="absolute top-3 right-3 opacity-60 group-hover:opacity-100 transition-all duration-200 group-hover:scale-110">
                                <Send className="w-3 h-3 text-blue-600" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className={cn(
                  'flex items-center gap-1 text-xs px-1',
                  message.role === 'user' ? 'text-blue-200 justify-end' : 'text-gray-400 justify-start'
                )}>
                  <span>{formatTime(message.timestamp)}</span>
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-lg mt-1 border-2 border-gray-200">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}

        {/* Enhanced loading indicator */}
        {(isLoading || isTyping) && (
          <div className="flex gap-3 items-start justify-start animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg mt-1 border-2 border-blue-100">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/90 rounded-2xl px-4 py-3 shadow-lg border border-gray-200 rounded-bl-md flex items-center gap-2 backdrop-blur-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              {/* <span className="text-[15px] text-gray-600 ml-1">Thinking...</span>  */}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Section */}
      <div className="sticky bottom-0 z-10 px-6 pt-4 pb-6 bg-white/95 backdrop-blur-sm border-t border-gray-100">
        <style jsx>{`
          .invisible-scrollbar {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE 10+ */
          }
          .invisible-scrollbar::-webkit-scrollbar {
            display: none; /* WebKit */
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
        
        {/* Character counter and status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Ready to help with system design</span>
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium transition-colors duration-200",
            isOverLimit ? "text-red-500" : characterCount > MAX_CHARACTERS * 0.8 ? "text-orange-500" : "text-gray-400"
          )}>
            <span>{characterCount}/{MAX_CHARACTERS}</span>
            {isOverLimit && <span className="text-red-500">⚠️</span>}
          </div>
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about system design..."
              className={cn(
                "w-full px-4 py-3 pr-20 rounded-2xl border bg-white/95 text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent shadow-lg placeholder:text-gray-400 resize-none overflow-hidden transition-all duration-200 backdrop-blur-sm invisible-scrollbar",
                isOverLimit 
                  ? "border-red-300 focus:ring-red-400 shadow-red-100" 
                  : "border-gray-200 focus:ring-blue-400 shadow-gray-100 hover:shadow-xl"
              )}
              disabled={isLoading}
              autoFocus
              rows={1}
              style={{
                height: '48px',
                minHeight: '48px',
                maxHeight: '128px',
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
            
            {/* Enhanced larger send button inside textarea */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isLoading || isOverLimit}
              className="absolute right-3 bottom-3 w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:scale-105 active:scale-95 hover:shadow-xl cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Warning message when over limit */}
        {isOverLimit && (
          <div className="mt-2 flex items-center gap-2 text-xs text-red-500 font-medium animate-fadeIn">
            <span>⚠️</span>
            <span>Message is too long. Please reduce by {characterCount - MAX_CHARACTERS} characters.</span>
          </div>
        )}

        {/* Enhanced Footer */}
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            InfraAI can make mistakes. Report issues on
            <a 
              href="https://www.github.com/altamsh04" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200 font-medium"
            >
              {' '} GitHub
            </a>
          </p>
        </div>
      </div>

{/* Enhanced Sign In Modal */}
{showSignIn && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn">
    <div className="bg-white rounded-3xl shadow-2xl p-8 relative max-w-md w-full mx-4 border border-gray-100 flex flex-col items-center justify-center">
      <button
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
        onClick={() => setShowSignIn(false)}
        style={{ zIndex: 10000 }}
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>
      <div className="w-full flex items-center justify-center">
        <SignIn
          afterSignInUrl={
            typeof window !== 'undefined' ? window.location.href : '/'
          }
        />
      </div>
    </div>
  </div>
)}

    </div>
  );
}