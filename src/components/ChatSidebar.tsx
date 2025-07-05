import React from 'react';
import { ChatInterface } from './ChatInterface';

interface ChatSidebarProps extends React.ComponentProps<typeof ChatInterface> {
  open: boolean;
}

export default function ChatSidebar({ open, ...props }: ChatSidebarProps) {
  return (
    <div
      className={`
        h-full z-40 flex-shrink-0 transition-all duration-300 ease-in-out
        ${open 
          ? 'bg-white shadow-2xl border-r border-gray-200' 
          : 'bg-white shadow-none border-0'
        }
      `}
      style={{ 
        width: open ? '420px' : '0px',
        maxWidth: open ? '95vw' : '0px',
        overflow: 'hidden'
      }}
    >
      <div 
        className="h-full flex flex-col"
        style={{ 
          width: '420px',
          maxWidth: '95vw',
          opacity: open ? 1 : 0,
          transition: 'opacity 300ms ease-in-out'
        }}
      >
        <ChatInterface {...props} />
      </div>
    </div>
  );
}