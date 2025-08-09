'use client';

import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
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
import { User, Network, Database, Server, Shield, Settings, Cloud, Code, Zap, Globe, Trash, MessageCircle, X, Upload, Download, ChevronDown } from 'lucide-react';
import Image from 'next/image';

// Mock types for the components (since we don't have the actual imports)
interface SystemComponent {
  id: string;
  name: string;
  icon?: string;
}

interface ComponentGroup {
  name: string;
  components: SystemComponent[];
}

type GroupConnection = { from: string; to: string; label?: string };

// Group name to icon mapping
const groupIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
          <Image
            src={component.icon}
            alt={component.name}
            width={40}
            height={40}
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
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  systemDesignTitle?: string | null;
  credits?: number | null;
  onImportDesign?: (imported: { groups: ComponentGroup[]; connections: GroupConnection[]; systemDesignTitle?: string | null }) => void;
}

function SystemDesignCanvasInner(props: SystemDesignCanvasProps) {
  const { groups, connections = [], onGroupsChange, sidebarOpen, onToggleSidebar, systemDesignTitle, onImportDesign } = props;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [localGroups, setLocalGroups] = useState(groups);
  const [localConnections, setLocalConnections] = useState(connections);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Layout configuration
  const groupY = 150;

  // Client node (placed to the left) - memoized to prevent recreation on every render
  const clientNode = useMemo((): Node => ({
    id: 'client',
    type: 'client',
    data: {},
    position: { x: 40, y: groupY + 50 },
    draggable: true,
  }), [groupY]);

  // Title node - memoized to prevent recreation on every render
  const titleNode = useMemo((): Node | null => {
    if (!systemDesignTitle) return null;
    return {
      id: 'system-design-title',
      type: 'title',
      data: { title: systemDesignTitle },
      position: { x: 500, y: 40 },
      draggable: true,
      style: { zIndex: 10 },
    };
  }, [systemDesignTitle]);

  // Combine all connections with the same from/to group into a single edge with a combined label
  const groupEdges = useMemo((): Edge[] => {
    const edgeMap = new Map<string, { from: string; to: string; labels: Set<string> }>();
    (connections || []).forEach((conn: GroupConnection) => {
      const key = `${conn.from}__${conn.to}`;
      if (!edgeMap.has(key)) {
        edgeMap.set(key, { from: conn.from, to: conn.to, labels: new Set() });
      }
      edgeMap.get(key)!.labels.add(conn.label || '');
    });

    return Array.from(edgeMap.values()).map((edge, idx) => ({
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
  }, [connections]);

  // Mock ELK positions for demo
  const elkPositions = useMemo((): Record<string, { x: number; y: number }> => {
    const positions: Record<string, { x: number; y: number }> = {};
    groups.forEach((group, index) => {
      positions[group.name] = { x: 200 + index * 450, y: 150 };
    });
    return positions;
  }, [groups]);

  // Create group nodes
  const groupNodes = useMemo((): Node[] => {
    return groups.map((group: ComponentGroup, index: number) => {
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
  }, [groups, elkPositions]);

  // Create component nodes
  const componentNodes = useMemo((): Node[] => {
    return groups.flatMap((group) => {
      const groupId = `group-${group.name}`;
      const componentX = (380 - 280) / 2;
      const numComponents = group.components.length;
      const totalComponentsHeight = numComponents * 100 + Math.max(0, numComponents - 1) * 20;
      const topMargin = (totalComponentsHeight - totalComponentsHeight) / 2;
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
  }, [groups]);

  // Update nodes and edges when groups change
  useEffect(() => {
    const currentAllNodes = [
      ...(titleNode ? [titleNode] : []),
      clientNode,
      ...groupNodes,
      ...componentNodes,
    ];
    const currentAllEdges = [...groupEdges];
    
    setNodes(currentAllNodes);
    setEdges(currentAllEdges);
  }, [titleNode, clientNode, groupNodes, componentNodes, groupEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle import file selection
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          // Validate structure
          if (
            json &&
            Array.isArray(json.groups) &&
            Array.isArray(json.connections) &&
            (typeof json.systemDesignTitle === 'string' || json.systemDesignTitle === null || json.systemDesignTitle === undefined)
          ) {
            if (onImportDesign) {
              onImportDesign({
                groups: json.groups,
                connections: json.connections,
                systemDesignTitle: json.systemDesignTitle ?? null,
              });
            }
          } else {
            alert('Invalid InfraAI design file.');
          }
        } catch {
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
      // Reset the input
      event.target.value = '';
    }
  };

  // Handle export options
  const handleExportJSON = () => {
    // Only export if there is a design
    if (!groups || groups.length === 0) return;
    const exportData = {
      groups,
      connections, // use the prop directly
      systemDesignTitle,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'infraai-system-design.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };



  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Element)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Floating toolbar with Import/Export
  const Toolbar = () => (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-blue-600 rounded-full shadow-lg px-4 py-2 border border-blue-700 backdrop-blur">
      {/* Import Button with Tooltip */}
      <div className="relative group">
        <button
          onClick={handleImportClick}
          className="px-3 py-1 text-sm font-medium rounded-full text-white hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
          title="Import InfraAI (.json) design file"
        >
          <Download className="w-4 h-4" />
          Import
        </button>
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Import InfraAI (.json) design file
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>

      {/* Export Button with Dropdown - only show if groups exist */}
      {groups && groups.length > 0 && (
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3 py-1 text-sm font-medium rounded-full text-white hover:bg-blue-700 hover:shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Export
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Export Options Menu */}
          {showExportMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[200px] py-1 z-30">
              <button
                onClick={handleExportJSON}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 text-sm cursor-pointer"
              >
                <div>
                  <div className="font-medium">.JSON</div>
                  <div className="text-xs text-gray-500">Special InfraAI Design</div>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
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
    const handleDeleteGroup = (e: CustomEvent) => {
      const groupName = e.detail.groupName;
      const updatedGroups = localGroups.filter(g => g.name !== groupName);
      const updatedConnections = localConnections.filter(conn => conn.from !== groupName && conn.to !== groupName);
      setLocalGroups(updatedGroups);
      setLocalConnections(updatedConnections);
      if (onGroupsChange) onGroupsChange(updatedGroups);
    };
    window.addEventListener('delete-group', handleDeleteGroup as EventListener);
    return () => window.removeEventListener('delete-group', handleDeleteGroup as EventListener);
  }, [onGroupsChange]);

  // Show a message when no groups are present
  if (groups.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center relative">
        {/* Toggle Button */}
        {onToggleSidebar && <ToggleButton />}

        {/* Import/Export Toolbar - Always visible */}
        <Toolbar />

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