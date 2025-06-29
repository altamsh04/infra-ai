'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSystemRequest: (request: string) => Promise<void>;
  isLoading: boolean;
  explanation?: string;
}

export function ChatInterface({ 
  onSystemRequest, 
  isLoading, 
  explanation 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI system design assistant. Describe your system requirements and I'll help you design the perfect architecture. For example: 'Build a highly scalable URL shortener with cache, auth, and database failover'",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (explanation) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          content: explanation,
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  }, [explanation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      await onSystemRequest(inputValue);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: 'Sorry, I encountered an error while analyzing your request. Please try again.',
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-blue-50 border-r border-gray-200 shadow-xl rounded-l-2xl overflow-hidden" style={{ fontFamily: 'var(--font-geist-sans), Inter, sans-serif' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 p-5 border-b border-gray-100 bg-white/80 backdrop-blur flex flex-col gap-1 shadow-sm">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          <h2 className="font-bold text-lg text-gray-900 tracking-tight">System Design Assistant</h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Describe your system requirements and get AI-powered architecture recommendations
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-transparent">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 shadow">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[75%] rounded-2xl px-5 py-3 shadow-md',
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
              )}
            >
              <p className="text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <p className={cn(
                'text-xs mt-2 text-right',
                message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
              )}>
                {formatTime(message.timestamp)}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 shadow">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 shadow">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div className="bg-white rounded-2xl px-5 py-3 shadow-md border border-gray-100 flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
              <span className="text-base text-gray-600">Analyzing your request...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 z-10 p-5 border-t border-gray-100 bg-white/90 backdrop-blur">
        <form onSubmit={handleSubmit} className="flex gap-3 items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe your system requirements..."
            className="flex-1 px-5 py-3 rounded-2xl border border-gray-200 bg-white text-base text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm placeholder:text-gray-400"
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold text-base shadow-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
} 