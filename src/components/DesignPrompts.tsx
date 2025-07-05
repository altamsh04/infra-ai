import React from 'react';
import { Database, Globe, ShoppingCart } from 'lucide-react';

interface DesignPromptProps {
  onPromptSelect: (prompt: string) => void;
}

const designPrompts = [
  {
    id: 1,
    prompt: "Design a highly scalable URL shortener like bit.ly that can handle 100M URLs per day with Redis caching, database sharding, custom domains, analytics, and rate limiting"
  },
  {
    id: 2,
    prompt: "Build a distributed e-commerce system supporting 1M+ products with inventory management, payment processing, order fulfillment, recommendation engine, and real-time notifications"
  },
  {
    id: 3,
    prompt: "Create a real-time chat application like WhatsApp with message delivery, group chats, file sharing, end-to-end encryption, offline support, and push notifications for 10M+ users"
  },
];

export function DesignPrompt({ onPromptSelect }: DesignPromptProps) {
  return (
    <div className="px-6 py-2 border-b border-gray-200/80 bg-white/95">
      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {designPrompts.map((prompt) => {
          return (
            <button
              key={prompt.id}
              onClick={() => onPromptSelect(prompt.prompt)}
              className="flex-shrink-0 group relative overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer min-w-[180px]"
            >
              <div className="p-2 flex flex-col items-center text-center space-y-2">
                <div>
                  <p className="text-xs text-gray-500 leading-tight">
                    {prompt.prompt}
                  </p>
                </div>
              </div>
               
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10" />
            </button>
          );
        })}
      </div>
    </div>
  );
}