'use client';

import React from 'react';
import { getBezierPath, EdgeProps, BaseEdge, EdgeLabelRenderer } from 'reactflow';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition = Position.Right,
  targetPosition = Position.Left,
  style = {},
  markerEnd,
  label,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} style={{ ...style, zIndex: 10, pointerEvents: 'auto' }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            fontSize: 12,
            fontWeight: 600,
            color: '#fff',
            padding: '2px 6px',
            background: style.stroke || '#6366f1',
            borderRadius: 4,
            pointerEvents: 'all',
            zIndex: 11,
          }}
          className="shadow-md"
        >
          {label}
        </div>
      </EdgeLabelRenderer>
      {markerEnd && (
        <svg
          style={{
            position: 'absolute',
            transform: `translate(${targetX - 10}px, ${targetY - 10}px)`,
            zIndex: 11,
          }}
        >
          <marker
            id={`arrow-${id}`}
            markerWidth="12"
            markerHeight="12"
            refX="12"
            refY="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L12,6 L0,12 z" fill={style.stroke || '#6366f1'} />
          </marker>
          <path
            d={`M ${targetX - 12},${targetY} L ${targetX},${targetY}`}
            markerEnd={`url(#arrow-${id})`}
            fill="none"
            stroke="none"
          />
        </svg>
      )}
    </>
  );
}