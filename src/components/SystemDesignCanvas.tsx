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
import { User, Network, Database, Server, Shield, Settings, Cloud, Code, Zap, Globe, Trash, MessageCircle, X } from 'lucide-react';
import { SystemComponent, ComponentGroup } from '@/lib/ai';
import { ComponentNode } from './ComponentNode';
import { IconType } from 'react-icons';
import { FaReact, FaDatabase, FaServer, FaKey, FaGithub, FaGoogle, FaLinkedin, FaStripe, FaCloud, FaCogs } from 'react-icons/fa';
import ELK from 'elkjs/lib/elk.bundled.js';
import { useUser } from '@clerk/nextjs';

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
const GroupNode = ({ data, id, selected }: { data: { group: ComponentGroup }, id: string, selected?: boolean }) => {
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

  // Add delete handler via custom event
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const deleteEvent = new CustomEvent('delete-group', { detail: { groupName: group.name } });
    window.dispatchEvent(deleteEvent);
  };

  return (
    <div
      className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200 p-0 relative flex flex-col overflow-hidden group"
      style={{ height: `${totalHeight}px`, width: '380px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
    >
      {/* Delete Icon */}
      <button
        className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-full p-1 shadow transition opacity-0 group-hover:opacity-100"
        onClick={handleDelete}
        title="Delete group"
      >
        <Trash className="w-4 h-4" />
      </button>
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

// Client Node as a card
const ClientNode = () => (
  <div className="rounded-2xl shadow-xl bg-blue-500 flex flex-col items-center justify-center px-6 py-4 min-w-[120px] max-w-[140px] border-2 border-white transition-transform duration-150 hover:scale-105 hover:shadow-2xl font-sans">
    <User className="w-10 h-10 text-white mb-2" />
    <span className="text-base font-semibold text-white text-center tracking-tight leading-tight">Client</span>
  </div>
);

// Title Node Component
const TitleNode = ({ data }: { data: { title: string } }) => (
  <div className="bg-blue-700 text-white px-8 py-3 rounded-2xl shadow-lg border-2 border-blue-700 font-bold text-xl text-center min-w-[320px] max-w-[600px] cursor-move select-none">
    {data.title}
  </div>
);

const nodeTypes: NodeTypes = {
  component: CustomComponentNode,
  group: GroupNode,
  client: ClientNode,
  title: TitleNode,
};

interface SystemDesignCanvasProps {
  groups: ComponentGroup[];
  connections?: GroupConnection[];
  onGroupsChange?: (groups: ComponentGroup[]) => void;
  sidebarOpen?: boolean;        // New prop
  onToggleSidebar?: () => void; // New prop
  systemDesignTitle?: string | null; // Add this line
  credits?: number | null; // Add this line
}

type GroupConnection = { from: string; to: string; label?: string };

async function getElkLayout(
  groups: ComponentGroup[],
  connections: GroupConnection[],
  direction: string = 'RIGHT'
): Promise<Record<string, { x: number; y: number }>> {
  const elk = new ELK();
  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.layered.spacing.nodeNodeBetweenLayers': '80',
      'elk.spacing.nodeNode': '40',
    },
    children: groups.map((group: ComponentGroup) => ({
      id: group.name,
      width: 380,
      height: 260,
    })),
    edges: (connections || []).map((conn: GroupConnection, idx: number) => ({
      id: `e${idx}`,
      sources: [conn.from],
      targets: [conn.to],
    })),
  };
  const layout = await elk.layout(elkGraph);
  const posMap: Record<string, { x: number; y: number }> = {};
  if (layout.children) {
    layout.children.forEach((node: any) => {
      posMap[node.id] = {
        x: node.x,
        y: node.y,
      };
    });
  }
  return posMap;
}

function SystemDesignCanvasInner({
  groups,
  connections = [],
  onGroupsChange,
  sidebarOpen,
  onToggleSidebar,
  systemDesignTitle,
  credits,
}: SystemDesignCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [localGroups, setLocalGroups] = useState(groups);
  const [localConnections, setLocalConnections] = useState(connections);
  const { isSignedIn } = useUser();

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
    draggable: true, // Make client node draggable
  };

  // Combine all connections with the same from/to group into a single edge with a combined label
  const edgeMap = new Map<string, { from: string; to: string; labels: Set<string> }>();
  (connections || []).forEach((conn: GroupConnection) => {
    const key = `${conn.from}__${conn.to}`;
    if (!edgeMap.has(key)) {
      edgeMap.set(key, { from: conn.from, to: conn.to, labels: new Set() });
    }
    edgeMap.get(key)!.labels.add(conn.label || '');
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

  // Use ELK to layout group nodes
  const [elkPositions, setElkPositions] = useState<Record<string, { x: number; y: number }>>({});
  useEffect(() => {
    getElkLayout(groups, connections, 'RIGHT').then(setElkPositions);
  }, [groups, connections]);

  // Create group nodes (parent nodes) with ELK-calculated positions
  const groupNodes: Node[] = groups.map((group: ComponentGroup, index: number) => {
    const pos = elkPositions[group.name] || { x: 200 + index * 450, y: 150 };
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

  // Title node (placed above the groups)
  const titleNode: Node | null = systemDesignTitle
    ? {
        id: 'system-design-title',
        type: 'title',
        data: { title: systemDesignTitle },
        position: { x: 500, y: 40 }, // Default position above the groups
        draggable: true,
        style: { zIndex: 10 },
      }
    : null;

  // All nodes including title, client, groups, and components
  const allNodes = [
    ...(titleNode ? [titleNode] : []),
    clientNode,
    ...groupNodes,
    ...componentNodes,
  ];

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

  // Export functionality
  const exportAsImage = useCallback(() => {
    const reactFlowElement = document.querySelector('.react-flow');
    if (!reactFlowElement) return;

    // Get the dimensions of the ReactFlow container
    const rect = reactFlowElement.getBoundingClientRect();

    // Create a more comprehensive SVG representation of the architecture
    const svgWidth = Math.max(800, rect.width);
    const svgHeight = Math.max(600, rect.height);

    // Generate SVG content based on the current groups and connections
    const groupElements = groups.map((group, index) => {
      const x = 50 + (index % 2) * 350;
      const y = 50 + Math.floor(index / 2) * 200;

      const componentElements = group.components.map((component, compIndex) => {
        const compX = x + 20;
        const compY = y + 60 + compIndex * 40;
        return `
          <rect x="${compX}" y="${compY}" width="120" height="30" fill="#f3f4f6" stroke="#d1d5db" stroke-width="1" rx="4"/>
          <text x="${compX + 60}" y="${compY + 20}" text-anchor="middle" font-family="Arial" font-size="10" fill="#374151">${component.name}</text>
        `;
      }).join('');

      return `
        <rect x="${x}" y="${y}" width="300" height="150" fill="white" stroke="#6366f1" stroke-width="2" rx="8"/>
        <text x="${x + 150}" y="${y + 25}" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="#374151">${group.name}</text>
        ${componentElements}
      `;
    }).join('');

    // Generate connection lines
    const connectionElements = connections.map((conn, index) => {
      const fromGroup = groups.find(g => g.name === conn.from);
      const toGroup = groups.find(g => g.name === conn.to);
      if (!fromGroup || !toGroup) return '';

      const fromIndex = groups.indexOf(fromGroup);
      const toIndex = groups.indexOf(toGroup);
      const fromX = 200 + (fromIndex % 2) * 350;
      const fromY = 125 + Math.floor(fromIndex / 2) * 200;
      const toX = 200 + (toIndex % 2) * 350;
      const toY = 125 + Math.floor(toIndex / 2) * 200;

      return `
        <line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" stroke="#6366f1" stroke-width="2" marker-end="url(#arrowhead)"/>
        <text x="${(fromX + toX) / 2}" y="${(fromY + toY) / 2 - 5}" text-anchor="middle" font-family="Arial" font-size="10" fill="#6366f1">${conn.label || ''}</text>
      `;
    }).join('');

    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1"/>
          </marker>
        </defs>
        <rect width="100%" height="100%" fill="white"/>
        <text x="${svgWidth / 2}" y="30" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" fill="#1f2937">System Architecture Diagram</text>
        <text x="${svgWidth / 2}" y="50" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">Generated on ${new Date().toLocaleDateString()}</text>
        ${groupElements}
        ${connectionElements}
      `;

    // Convert SVG to blob and download
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    // Create download link
    const link = document.createElement('a');
    link.download = `architecture-diagram-${new Date().toISOString().split('T')[0]}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [groups, connections]);

  // Floating toolbar
  const Toolbar = () => (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-blue-600 rounded-full shadow-lg px-4 py-2 border border-blue-700 backdrop-blur">
      <button
        onClick={exportAsImage}
        className="px-3 py-1 text-sm font-medium rounded-full text-white hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export
      </button>
    </div>
  );

  // Single Toggle Button Component
  const ToggleButton = () => (
    <button
      className="fixed top-6 left-6 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
      onClick={onToggleSidebar}
      aria-label={sidebarOpen ? "Close chat" : "Open chat"}
    >
      {sidebarOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <MessageCircle className="w-6 h-6" />
      )}
    </button>
  );

  // Listen for delete-group event
  useEffect(() => {
    const handleDeleteGroup = (e: any) => {
      const groupName = e.detail.groupName;
      const updatedGroups = localGroups.filter(g => g.name !== groupName);
      const updatedConnections = localConnections.filter(conn => conn.from !== groupName && conn.to !== groupName);
      setLocalGroups(updatedGroups);
      setLocalConnections(updatedConnections);
      if (onGroupsChange) onGroupsChange(updatedGroups);
    };
    window.addEventListener('delete-group', handleDeleteGroup);
    return () => window.removeEventListener('delete-group', handleDeleteGroup);
  }, [localGroups, localConnections, onGroupsChange]);

  // Show a message when no groups are present
  if (groups.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center relative">
        {/* Toggle Button */}
        {onToggleSidebar && <ToggleButton />}

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
    <div className="relative w-full h-full">
      {/* Credits badge in top-right of canvas */}
      {isSignedIn && typeof credits === 'number' && (
        <div className="absolute top-6 right-6 z-40 flex items-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border shadow-sm transition-colors duration-200 ${credits === 0 ? 'bg-red-100 text-red-700 border-red-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
          >
            Credits: {credits}
          </span>
        </div>
      )}
      {/* React Flow Diagram */}
      <ReactFlowProvider>
        <div className="w-full h-full relative">
          {/* Toggle Button */}
          {onToggleSidebar && <ToggleButton />}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={2}
            className="react-flow"
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#c7d2fe" />
            <MiniMap nodeColor={() => '#6366f1'} nodeStrokeWidth={3} zoomable pannable />
            <Controls position="bottom-right" showInteractive={false} />
          </ReactFlow>
          <Toolbar />
        </div>
      </ReactFlowProvider>
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