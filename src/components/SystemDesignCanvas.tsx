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
  EdgeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { User, Network, Database, Server, Shield, Settings, Cloud, Code, Zap, Globe } from 'lucide-react';
import { SystemComponent, ComponentGroup } from '@/lib/ai';
import { ComponentNode } from './ComponentNode';
import CustomEdge from './CustomEdge'; // Updated custom edge
import { IconType } from 'react-icons';
import { FaReact, FaDatabase, FaServer, FaKey, FaGithub, FaGoogle, FaLinkedin, FaStripe, FaCloud, FaCogs } from 'react-icons/fa';

// Group name to icon mapping
const groupIconMap: Record<string, any> = {
  networking: Network,
  network: Network,
  cdn: Globe,
  api: Server,
  gateway: Server,
  compute: Zap,
  processing: Zap,
  backend: Server,
  server: Server,
  security: Shield,
  auth: Shield,
  authentication: Shield,
  authorization: Shield,
  devops: Settings,
  deployment: Settings,
  infrastructure: Settings,
  monitoring: Settings,
  storage: Database,
  database: Database,
  data: Database,
  cloud: Cloud,
  aws: Cloud,
  azure: Cloud,
  gcp: Cloud,
  frontend: Code,
  ui: Code,
  client: Code,
  default: Settings,
};

function getGroupIcon(groupName?: string) {
  if (!groupName) return Settings;
  
  const normalizedName = groupName.toLowerCase();
  
  if (groupIconMap[normalizedName]) {
    return groupIconMap[normalizedName];
  }
  
  for (const [key, icon] of Object.entries(groupIconMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return icon;
    }
  }
  
  return groupIconMap.default;
}

// Icon map for components
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

// Group Node Component
const GroupNode = ({ data }: { data: { group: ComponentGroup } }) => {
  const { group } = data;
  
  const labelHeight = 70;
  const verticalPadding = 20;
  const componentHeight = 100;
  const componentGap = 20;
  
  const contentHeight = group.components.length * componentHeight + 
                       Math.max(0, group.components.length - 1) * componentGap;
  const minContentHeight = 200;
  const actualContentHeight = Math.max(contentHeight, minContentHeight);
  const totalHeight = labelHeight + actualContentHeight + verticalPadding;

  const GroupIcon = getGroupIcon(group.name);

  return (
    <div 
      className="bg-white/80 rounded-2xl border-2 border-gray-200 p-0 relative flex flex-col overflow-hidden" 
      style={{ 
        height: `${totalHeight}px`,
        width: '380px',
        zIndex: 0, // Reduced to 0 to ensure edges are above
      }}
    >
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-md border border-gray-200">
        <GroupIcon className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-semibold text-gray-700">
          {group.name}
        </span>
      </div>
      <div 
        className="w-full h-full relative"
        style={{ 
          height: `${totalHeight}px`,
          paddingTop: `${labelHeight}px`
        }}
      />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  component: ComponentNode,
  group: GroupNode,
  client: ({ id }: any) => (
    <div className="rounded-full shadow-lg bg-blue-500 flex flex-col items-center justify-center px-4 py-4 min-w-[80px] max-w-[80px] border-2 border-white" style={{ zIndex: 0 }}>
      <User className="w-8 h-8 text-white mb-1" />
      <span className="text-xs font-semibold text-white">Client</span>
    </div>
  ),
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

interface SystemDesignCanvasProps {
  groups: ComponentGroup[];
  connections: Array<{ from: string; to: string; label?: string }>;
  onGroupsChange?: (groups: ComponentGroup[]) => void;
}

function SystemDesignCanvasInner({ 
  groups, 
  connections = [],
  onGroupsChange 
}: SystemDesignCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const groupSpacingX = 450;
  const groupY = 150;
  const startX = 200;

  const groupWidth = 380;
  const componentWidth = 280;
  const componentHeight = 100;
  const componentGap = 20;
  const labelHeight = 70;
  const verticalPadding = 20;

  const clientNode: Node = {
    id: 'client',
    type: 'client',
    data: {},
    position: { x: 40, y: groupY + 50 },
    draggable: false,
  };

  const groupNodes: Node[] = groups.map((group, index) => {
    const numComponents = group.components.length;
    const contentHeight = numComponents * componentHeight + Math.max(0, numComponents - 1) * componentGap;
    const minContentHeight = 200;
    const actualContentHeight = Math.max(contentHeight, minContentHeight);
    const totalHeight = labelHeight + actualContentHeight + verticalPadding;
    
    return {
      id: `group-${group.name}`,
      type: 'group',
      data: { group },
      position: { x: startX + index * groupSpacingX, y: groupY },
      draggable: true,
      style: { 
        zIndex: 0,
        width: `${groupWidth}px`,
        height: `${totalHeight}px`,
        border: 'none',
        background: 'transparent',
      },
    };
  });

  const componentNodes: Node[] = groups.flatMap((group, groupIndex) => {
    const groupId = `group-${group.name}`;
    const componentX = (groupWidth - componentWidth) / 2;
    const numComponents = group.components.length;
    const totalComponentsHeight = numComponents * componentHeight + 
                                 Math.max(0, numComponents - 1) * componentGap;
    const contentHeight = numComponents * componentHeight + Math.max(0, numComponents - 1) * componentGap;
    const minContentHeight = 200;
    const actualContentHeight = Math.max(contentHeight, minContentHeight);
    const availableContentSpace = actualContentHeight;
    const topMargin = (availableContentSpace - totalComponentsHeight) / 2;
    
    return group.components.map((component, componentIndex) => {
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
          zIndex: 0,
          width: `${componentWidth}px`, 
          height: `${componentHeight}px` 
        },
      };
    });
  });

  const allNodes = [clientNode, ...groupNodes, ...componentNodes];

  const aiEdges: Edge[] = Array.isArray(connections)
    ? connections.map((conn, idx) => ({
        id: `ai-conn-${conn.from}-${conn.to}-${idx}`,
        source: conn.from,
        target: conn.to,
        type: 'default',
        style: { stroke: '#6366f1', strokeWidth: 2, opacity: 0.95 },
        markerEnd: {
          type: 'arrowclosed',
          color: '#6366f1',
        },
        label: conn.label || '',
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 6,
        labelBgStyle: { fill: '#6366f1', color: '#fff' },
        labelStyle: { fill: '#fff', fontWeight: '600', fontSize: '11px' },
      }))
    : [];

  const fallbackEdges: Edge[] = [];

  if (groups.length > 0 && groups[0].components.length > 0 && !connections.some(conn => conn.from === 'client')) {
    fallbackEdges.push({
      id: `client-${groups[0].components[0].id}`,
      source: 'client',
      target: groups[0].components[0].id,
      type: 'custom',
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

  for (let i = 0; i < groups.length - 1; i++) {
    const currentGroup = groups[i];
    const nextGroup = groups[i + 1];
    
    if (currentGroup.components.length > 0 && nextGroup.components.length > 0) {
      const lastComponent = currentGroup.components[currentGroup.components.length - 1];
      const firstComponent = nextGroup.components[0];
      
      if (!connections.some(conn => conn.from === lastComponent.id && conn.to === firstComponent.id)) {
        fallbackEdges.push({
          id: `${lastComponent.id}-${firstComponent.id}`,
          source: lastComponent.id,
          target: firstComponent.id,
          type: 'custom',
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
  }

  const allEdges = [...aiEdges, ...fallbackEdges];

  useEffect(() => {
    setNodes(allNodes);
    setEdges(allEdges);
    console.log("Nodes:", allNodes);
    console.log("Edges:", allEdges);
  }, [groups, connections]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'custom' }, eds)),
    [setEdges]
  );

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
    <div className="w-full h-full relative" style={{ zIndex: 0 }}> {/* Ensure no conflicting stacking context */}
      <ReactFlow
        nodes={nodes}
        edges={allEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
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