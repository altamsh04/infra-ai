'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { SystemComponent } from '@/lib/ai';
import { cn } from '@/lib/utils';

interface ComponentNodeData {
  component: SystemComponent & { icon?: string }; // Aligns with existing data structure
}

export const ComponentNode = memo(({ data, id }: NodeProps<ComponentNodeData>) => {
  const { component } = data;

  return (
    <div
      className={cn(
        'rounded-xl shadow-xl bg-gradient-to-br from-white to-blue-50 flex flex-col items-center justify-center px-4 py-3 min-w-[140px] max-w-[180px] border border-gray-200 transition-transform duration-150 hover:scale-105 hover:shadow-2xl',
        'font-sans',
      )}
      style={{ fontFamily: 'var(--font-geist-sans), Inter, sans-serif' }}
      data-node-id={id} // Add for debugging
    >
      {/* Target Handle (Left) - Larger and interactive */}
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-target`}
        className="w-3 h-3 bg-blue-400 rounded-full border-2 border-white hover:bg-blue-500 transition-colors"
        style={{ left: '-6px', top: '50%', transform: 'translateY(-50%)' }}
      />
      {/* Icon with better fallback */}
      <img
        src={component.icon || 'https://via.placeholder.com/48x48?text=Icon'} // Smaller placeholder
        alt={component.name}
        className="w-12 h-12 mb-2 rounded-full shadow-sm object-contain bg-gray-100"
        draggable={false}
      />
      <span className="text-sm font-semibold text-gray-800 text-center tracking-tight leading-tight line-clamp-2">
        {component.name}
      </span>
      {/* Source Handle (Right) - Larger and interactive */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-source`}
        className="w-3 h-3 bg-green-400 rounded-full border-2 border-white hover:bg-green-500 transition-colors"
        style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)' }}
      />
    </div>
  );
});

ComponentNode.displayName = 'ComponentNode';