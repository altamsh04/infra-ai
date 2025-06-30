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
  MarkerType,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { User, Network, Database, Server, Shield, Settings, Cloud, Code, Zap, Globe } from 'lucide-react';
import { SystemComponent, ComponentGroup } from '@/lib/ai';
import { ComponentNode } from './ComponentNode';
import { IconType } from 'react-icons';
import { FaReact, FaDatabase, FaServer, FaKey, FaGithub, FaGoogle, FaLinkedin, FaStripe, FaCloud, FaCogs } from 'react-icons/fa';
import dagre from 'dagre';

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
      {/* Target handle (left) for container-to-container connections */}
      <Handle type="target" position={Position.Left} style={{ background: '#6366f1', width: 16, height: 16, borderRadius: 8, left: -8, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }} />
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
      {/* Source handle (right) for container-to-container connections */}
      <Handle type="source" position={Position.Right} style={{ background: '#10b981', width: 16, height: 16, borderRadius: 8, right: -8, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }} />
    </div>
  );
};

// Updated Custom Component Node with consistent sizing and NO handles for connections
const CustomComponentNode = ({ data }: { data: { component: SystemComponent } }) => {
  const { component } = data;
  const [iconError, setIconError] = useState(false);
  return (
    <div style={{ width: '280px', height: '100px', position: 'relative' }} className="flex flex-col items-center justify-center">
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
  connections?: { from: string; to: string; label: string }[];
  onGroupsChange?: (groups: ComponentGroup[]) => void;
}

// Add this style block at the top of the file or inside the component:
// Ensures ReactFlow edges overlay above nodes and containers
const edgeOverlayStyle: React.CSSProperties = {
  // ReactFlow edge layer is .react-flow__edges
  // This z-index must be higher than nodes (default is 1, so use 10+)
  // These are custom CSS vars, ReactFlow will pick them up if supported
  // @ts-ignore
  '--rf-z-index-edges': 20,
  '--rf-z-index-nodes': 10,
};

function getDagreLayout(groups, connections, direction = 'LR') {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction });

  // Add nodes (groups)
  groups.forEach((group) => {
    g.setNode(group.name, { width: 380, height: 260 }); // Use group card size
  });

  // Add edges (group-to-group)
  (connections || []).forEach((conn) => {
    g.setEdge(conn.from, conn.to);
  });

  dagre.layout(g);

  // Return a map of group name to dagre-calculated position
  const posMap = {};
  groups.forEach((group) => {
    const nodeWithPos = g.node(group.name);
    posMap[group.name] = {
      x: nodeWithPos.x - 190, // Center the group card
      y: nodeWithPos.y - 130,
    };
  });
  return posMap;
}

function SystemDesignCanvasInner({ 
  groups, 
  connections = [],
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

  // Combine all connections with the same from/to group into a single edge with a combined label
  const edgeMap = new Map<string, { from: string; to: string; labels: Set<string> }>();
  (connections || []).forEach((conn) => {
    const key = `${conn.from}__${conn.to}`;
    if (!edgeMap.has(key)) {
      edgeMap.set(key, { from: conn.from, to: conn.to, labels: new Set() });
    }
    edgeMap.get(key)!.labels.add(conn.label);
  });

  const groupEdges: Edge[] = Array.from(edgeMap.values()).map((edge, idx) => ({
    id: `group-conn-${edge.from}-${edge.to}-${idx}`,
    source: `group-${edge.from}`,
    target: `group-${edge.to}`,
    type: 'smoothstep',
    style: { stroke: '#6366f1', strokeWidth: 3 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#6366f1',
    },
    label: Array.from(edge.labels).join(', '),
    labelBgPadding: [6, 2],
    labelBgBorderRadius: 6,
    labelBgStyle: { fill: '#6366f1', color: '#fff' },
    labelStyle: { fill: '#fff', fontWeight: '700' },
  }));

  // Use dagre to layout group nodes
  const dagrePositions = getDagreLayout(groups, connections, 'LR');

  // Create group nodes (parent nodes) with dagre-calculated positions
  const groupNodes: Node[] = groups.map((group, index) => {
    const pos = dagrePositions[group.name] || { x: 200 + index * 450, y: 150 };
    const numComponents = group.components.length;
    const contentHeight = numComponents * 100 + Math.max(0, numComponents - 1) * 20;
    const minContentHeight = 200;
    const actualContentHeight = Math.max(contentHeight, minContentHeight);
    const totalHeight = 70 + actualContentHeight + 20;
    return {
      id: `group-${group.name}`,
      type: 'group',
      data: { group },
      position: pos,
      draggable: true,
      style: { 
        zIndex: 1,
        width: `380px`,
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
    const componentX = (380 - 280) / 2;
    const numComponents = group.components.length;
    const totalComponentsHeight = numComponents * 100 + Math.max(0, numComponents - 1) * 20;
    const contentHeight = numComponents * 100 + Math.max(0, numComponents - 1) * 20;
    const minContentHeight = 200;
    const actualContentHeight = Math.max(contentHeight, minContentHeight);
    const availableContentSpace = actualContentHeight;
    const topMargin = (availableContentSpace - totalComponentsHeight) / 2;
    return group.components.map((component, componentIndex) => {
      const componentY = 70 + 10 + topMargin + (componentIndex * (100 + 20));
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
          width: `280px`, 
          height: `100px` 
        },
      };
    });
  });

  // All nodes including client, groups, and components
  const allNodes = [clientNode, ...groupNodes, ...componentNodes];

  // Only use groupEdges for allEdges
  const allEdges = [...groupEdges];

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
    <div className="w-full h-full relative" style={edgeOverlayStyle}>
      {/*
        Z-INDEX FIX: The style above ensures that the .react-flow__edges layer overlays on top of all nodes and containers.
        If you use custom node styles, ensure their z-index is lower than the edge layer.
      */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        className=""
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