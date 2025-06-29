'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  ReactFlowProvider,
  Position,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { User, Network, Database, Server, Shield, Settings, Cloud, Code, Zap, Globe } from 'lucide-react';
import { SystemComponent, ComponentGroup } from '@/lib/ai';
import { ComponentNode } from './ComponentNode';
import { IconType } from 'react-icons';
import { FaReact, FaDatabase, FaServer, FaKey, FaGithub, FaGoogle, FaLinkedin, FaStripe, FaCloud, FaCogs } from 'react-icons/fa';

// Group name to icon mapping
const groupIconMap: Record<string, any> = {
  // Networking related
  networking: Network,
  network: Network,
  cdn: Globe,
  api: Server,
  gateway: Server,
  
  // Compute related
  compute: Zap,
  processing: Zap,
  backend: Server,
  server: Server,
  
  // Security related
  security: Shield,
  auth: Shield,
  authentication: Shield,
  authorization: Shield,
  
  // DevOps related
  devops: Settings,
  deployment: Settings,
  infrastructure: Settings,
  monitoring: Settings,
  
  // Storage related
  storage: Database,
  database: Database,
  data: Database,
  
  // Cloud related
  cloud: Cloud,
  aws: Cloud,
  azure: Cloud,
  gcp: Cloud,
  
  // Frontend related
  frontend: Code,
  ui: Code,
  client: Code,
  
  // Default
  default: Settings,
};

function getGroupIcon(groupName?: string) {
  if (!groupName) return Settings;
  
  const normalizedName = groupName.toLowerCase();
  
  // Try exact match first
  if (groupIconMap[normalizedName]) {
    return groupIconMap[normalizedName];
  }
  
  // Try partial matches
  for (const [key, icon] of Object.entries(groupIconMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return icon;
    }
  }
  
  return groupIconMap.default;
}

// Icon map for components (expand as needed)
const componentIconMap: Record<string, IconType> = {
  react: FaReact,
  database: FaDatabase,
  api: FaServer,
  auth: FaKey,
  github: FaGithub,
  google: FaGoogle,
  linkedin: FaLinkedin,
  stripe: FaStripe,
  cloud: FaCloud,
  backend: FaServer,
  cogs: FaCogs,
};

function getComponentIcon(icon?: string) {
  if (!icon) return null;
  const Icon = componentIconMap[icon.toLowerCase()];
  return Icon ? <Icon className="w-5 h-5 mr-2" /> : null;
}

// Group Node Component (container) - Simple design with top-left label
const GroupNode = ({ data }: { data: { group: ComponentGroup } }) => {
  const { group } = data;
  
  // Consistent sizing constants - UPDATED to match component positioning
  const labelHeight = 70; // Space reserved for the top label (increased)
  const verticalPadding = 20; // Additional padding below label
  const componentHeight = 100; // Match CustomComponentNode height
  const componentGap = 20;
  
  // Calculate exact content height needed
  const contentHeight = group.components.length * componentHeight + 
                       Math.max(0, group.components.length - 1) * componentGap;
  
  // Minimum content area to ensure groups look proportional
  const minContentHeight = 200;
  const actualContentHeight = Math.max(contentHeight, minContentHeight);
  
  const totalHeight = labelHeight + actualContentHeight + verticalPadding;

  // Get appropriate icon for the group
  const GroupIcon = getGroupIcon(group.name);

  return (
    <div 
      className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200 p-0 relative flex flex-col overflow-hidden" 
      style={{ 
        height: `${totalHeight}px`,
        width: '380px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Top-left label with icon - FIXED positioning */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-md border border-gray-200">
        <GroupIcon className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-semibold text-gray-700">
          {group.name}
        </span>
      </div>
      
      {/* Content area for components - PROPERLY sized */}
      <div 
        className="w-full h-full relative"
        style={{ 
          height: `${totalHeight}px`,
          paddingTop: `${labelHeight}px` // Reserve space for label
        }}
      />
    </div>
  );
};

// Updated Custom Component Node with consistent sizing
const CustomComponentNode = ({ data }: { data: { component: SystemComponent } }) => {
  const { component } = data;
  const [iconError, setIconError] = useState(false);
  return (
    <div 
      className="flex flex-col items-center justify-center" 
      style={{ width: '280px', height: '100px' }}
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3 overflow-hidden">
        {!iconError && component.icon ? (
          <img
            src={component.icon}
            alt={component.name}
            className="w-10 h-10 object-contain"
            onError={() => setIconError(true)}
            draggable={false}
          />
        ) : (
          // Fallback: generic placeholder SVG
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="#e5e7eb" />
            <path d="M16 10a3 3 0 100 6 3 3 0 000-6zm0 8c-3.31 0-6 2.01-6 4.5V24h12v-1.5c0-2.49-2.69-4.5-6-4.5z" fill="#9ca3af" />
          </svg>
        )}
      </div>
      <div className="text-1xl font-bold text-gray-700 text-center mb-1 leading-tight">
        {component.name}
      </div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  component: CustomComponentNode,
  group: GroupNode,
  client: ({ id }: any) => (
    <div className="rounded-full shadow-lg bg-blue-500 flex flex-col items-center justify-center px-4 py-4 min-w-[80px] max-w-[80px] border-2 border-white">
      <User className="w-8 h-8 text-white mb-1" />
      <span className="text-xs font-semibold text-white">Client</span>
    </div>
  ),
};

interface SystemDesignCanvasProps {
  groups: ComponentGroup[];
  onGroupsChange?: (groups: ComponentGroup[]) => void;
}

function SystemDesignCanvasInner({ 
  groups, 
  onGroupsChange 
}: SystemDesignCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Layout configuration
  const groupSpacingX = 450;
  const groupY = 150;
  const startX = 200;

  // Component sizing constants - UPDATED to prevent overlap
  const groupWidth = 380;
  const componentWidth = 280;
  const componentHeight = 100; // Matches CustomComponentNode
  const componentGap = 20;
  const labelHeight = 70; // Space reserved for the top label (increased)
  const verticalPadding = 20; // Additional padding below label

  // Client node (placed to the left)
  const clientNode: Node = {
    id: 'client',
    type: 'client',
    data: {},
    position: { x: 40, y: groupY + 50 },
    draggable: false,
  };

  // Create group nodes (parent nodes) with accurate sizing
  const groupNodes: Node[] = groups.map((group, index) => {
    const numComponents = group.components.length;
    const contentHeight = numComponents * componentHeight + Math.max(0, numComponents - 1) * componentGap;
    const minContentHeight = 200;
    const actualContentHeight = Math.max(contentHeight, minContentHeight);
    const totalHeight = labelHeight + actualContentHeight + verticalPadding; // FIXED calculation
    
    return {
      id: `group-${group.name}`,
      type: 'group',
      data: { group },
      position: { x: startX + index * groupSpacingX, y: groupY },
      draggable: true,
      style: { 
        zIndex: 1,
        width: `${groupWidth}px`,
        height: `${totalHeight}px`,
        border: 'none',
        background: 'transparent',
        boxShadow: 'none'
      },
    };
  });

  // Create component nodes with PERFECT centering and NO overlap
  const componentNodes: Node[] = groups.flatMap((group, groupIndex) => {
    const groupId = `group-${group.name}`;
    
    // Perfect horizontal centering
    const componentX = (groupWidth - componentWidth) / 2;
    
    // Calculate EXACT vertical positioning - FIXED to avoid label overlap
    const numComponents = group.components.length;
    const totalComponentsHeight = numComponents * componentHeight + 
                                 Math.max(0, numComponents - 1) * componentGap;
    
    // Available height for components (excluding label space)
    const contentHeight = numComponents * componentHeight + Math.max(0, numComponents - 1) * componentGap;
    const minContentHeight = 200;
    const actualContentHeight = Math.max(contentHeight, minContentHeight);
    
    // Center components vertically in the available content area BELOW the label
    const availableContentSpace = actualContentHeight;
    const topMargin = (availableContentSpace - totalComponentsHeight) / 2;
    
    return group.components.map((component, componentIndex) => {
      // CRITICAL FIX: Start positioning AFTER the label height with extra margin
      const componentY = labelHeight + 10 + topMargin + 
                        (componentIndex * (componentHeight + componentGap));
      
      return {
        id: component.id,
        type: 'component',
        data: { component },
        position: {
          x: componentX,
          y: componentY,
        },
        parentNode: groupId,
        extent: 'parent',
        draggable: false,
        style: { 
          zIndex: 2, 
          width: `${componentWidth}px`, 
          height: `${componentHeight}px` 
        },
      };
    });
  });

  // All nodes including client, groups, and components
  const allNodes = [clientNode, ...groupNodes, ...componentNodes];

  // Create edges connecting groups horizontally
  const groupEdges: Edge[] = [];

  // Connect client to first group
  if (groups.length > 0) {
    groupEdges.push({
      id: `client-group-${groups[0].name}`,
      source: 'client',
      target: `group-${groups[0].name}`,
      type: 'straight',
      style: { stroke: '#2563eb', strokeWidth: 3 },
      markerEnd: {
        type: 'arrowclosed',
        color: '#2563eb',
      },
      label: 'Request',
      labelBgPadding: [6, 2],
      labelBgBorderRadius: 6,
      labelBgStyle: { fill: '#2563eb', color: '#fff' },
      labelStyle: { fill: '#fff', fontWeight: '700' },
    });

    // Also connect client to first component in first group
    if (groups[0].components.length > 0) {
      groupEdges.push({
        id: `client-${groups[0].components[0].id}`,
        source: 'client',
        target: groups[0].components[0].id,
        type: 'straight',
        style: { stroke: '#2563eb', strokeWidth: 2, strokeDasharray: '5,5' },
        markerEnd: {
          type: 'arrowclosed',
          color: '#2563eb',
        },
        label: 'Direct',
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 6,
        labelBgStyle: { fill: '#2563eb', color: '#fff' },
        labelStyle: { fill: '#fff', fontWeight: '600' },
      });
    }
  }

  // Connect groups horizontally
  for (let i = 0; i < groups.length - 1; i++) {
    const currentGroupId = `group-${groups[i].name}`;
    const nextGroupId = `group-${groups[i + 1].name}`;
    
    groupEdges.push({
      id: `${currentGroupId}-${nextGroupId}`,
      source: currentGroupId,
      target: nextGroupId,
      type: 'straight',
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: {
        type: 'arrowclosed',
        color: '#3b82f6',
      },
      label: 'Flow',
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 6,
      labelBgStyle: { fill: '#3b82f6', color: '#fff' },
      labelStyle: { fill: '#fff', fontWeight: '600' },
    });
  }

  // Add component-to-component connections within and between groups
  const componentEdges: Edge[] = [];
  
  // Connect components within each group
  groups.forEach((group, groupIndex) => {
    for (let i = 0; i < group.components.length - 1; i++) {
      const currentComponent = group.components[i];
      const nextComponent = group.components[i + 1];
      
      componentEdges.push({
        id: `${currentComponent.id}-${nextComponent.id}`,
        source: currentComponent.id,
        target: nextComponent.id,
        type: 'straight',
        style: { stroke: '#10b981', strokeWidth: 1.5, strokeDasharray: '5,5' },
        markerEnd: {
          type: 'arrowclosed',
          color: '#10b981',
        },
        label: 'Internal',
        labelBgPadding: [3, 1],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: '#10b981', color: '#fff' },
        labelStyle: { fill: '#fff', fontWeight: '500', fontSize: '10px' },
      });
    }
  });

  // Connect components between groups (last component of one group to first component of next group)
  for (let i = 0; i < groups.length - 1; i++) {
    const currentGroup = groups[i];
    const nextGroup = groups[i + 1];
    
    if (currentGroup.components.length > 0 && nextGroup.components.length > 0) {
      const lastComponent = currentGroup.components[currentGroup.components.length - 1];
      const firstComponent = nextGroup.components[0];
      
      componentEdges.push({
        id: `${lastComponent.id}-${firstComponent.id}`,
        source: lastComponent.id,
        target: firstComponent.id,
        type: 'straight',
        style: { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '8,4' },
        markerEnd: {
          type: 'arrowclosed',
          color: '#8b5cf6',
        },
        label: 'Cross-Group',
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 6,
        labelBgStyle: { fill: '#8b5cf6', color: '#fff' },
        labelStyle: { fill: '#fff', fontWeight: '600', fontSize: '11px' },
      });
    }
  }

  // Combine all edges
  const allEdges = [...groupEdges, ...componentEdges];

  // Update nodes and edges when groups change
  useEffect(() => {
    setNodes(allNodes);
    setEdges(allEdges);
  }, [groups]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Floating toolbar
  const Toolbar = () => (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-white/90 rounded-full shadow-lg px-4 py-2 border border-gray-200 backdrop-blur">
      <button className="px-3 py-1 text-sm font-medium rounded-full hover:bg-blue-100 transition-colors">
        Zoom In
      </button>
      <button className="px-3 py-1 text-sm font-medium rounded-full hover:bg-blue-100 transition-colors">
        Zoom Out
      </button>
      <button className="px-3 py-1 text-sm font-medium rounded-full hover:bg-blue-100 transition-colors">
        Export
      </button>
    </div>
  );

  // Show a message when no groups are present
  if (groups.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Architecture Yet
          </h3>
          <p className="text-gray-500">
            Describe your system requirements to generate an architecture diagram
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        className="bg-gradient-to-br from-gray-50 to-blue-100"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#cbd5e1"
        />
        <Controls />
        <MiniMap
          nodeColor="#3b82f6"
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
      <Toolbar />
    </div>
  );
}

export function SystemDesignCanvas(props: SystemDesignCanvasProps) {
  return (
    <ReactFlowProvider>
      <SystemDesignCanvasInner {...props} />
    </ReactFlowProvider>
  );
}