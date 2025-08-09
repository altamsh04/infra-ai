'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { SystemComponent } from '@/lib/ai';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ComponentNodeData {
  component: SystemComponent & { icon?: string };
}

export const ComponentNode = memo(({ data }: NodeProps<ComponentNodeData>) => {
  const { component } = data;
  return (
    <div
      className={cn(
        'rounded-xl shadow-xl bg-gradient-to-br from-white to-blue-50 flex flex-col items-center justify-center px-6 py-4 min-w-[120px] max-w-[140px] border border-gray-200 transition-transform duration-150 hover:scale-105 hover:shadow-2xl',
        'font-sans',
      )}
      style={{ fontFamily: 'var(--font-geist-sans), Inter, sans-serif' }}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-blue-400" />
      <Image
        src={component.icon || 'https://placehold.co/100x100'}
        alt={component.name}
        width={48}
        height={48}
        className="w-12 h-12 mb-2 rounded-full shadow-sm object-contain bg-gray-100"
        draggable={false}
      />
      <span className="text-base font-semibold text-gray-800 text-center tracking-tight leading-tight">
        {component.name}
      </span>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-green-400" />
    </div>
  );
});

ComponentNode.displayName = 'ComponentNode'; 