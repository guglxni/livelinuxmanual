/**
 * Interactive Knowledge Graph Visualization
 * Displays system calls, concepts, and their relationships
 */
import React, { useEffect, useRef, useState } from 'react';

interface GraphNode {
  id: string;
  type: 'syscall' | 'concept' | 'errno';
  label: string;
  cluster: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (nodeId: string) => void;
  selectedNode?: string;
}

const CLUSTER_COLORS: Record<string, string> = {
  file_io: '#21409a',
  process: '#be1e2d',
  signals: '#f9a825',
  fundamentals: '#4caf50',
  errors: '#9c27b0',
  types: '#00bcd4',
  concepts: '#ff5722'
};

export function KnowledgeGraph({ nodes, edges, onNodeClick, selectedNode }: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const animationRef = useRef<number>();
  const isDragging = useRef(false);
  const dragNode = useRef<GraphNode | null>(null);

  // Initialize node positions
  useEffect(() => {
    const initialized = nodes.map((node, i) => {
      const clusterIndex = Object.keys(CLUSTER_COLORS).indexOf(node.cluster);
      const angle = (clusterIndex / Object.keys(CLUSTER_COLORS).length) * Math.PI * 2;
      const radius = 150 + Math.random() * 50;
      
      return {
        ...node,
        x: dimensions.width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * 100,
        y: dimensions.height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * 100,
        vx: 0,
        vy: 0
      };
    });
    setGraphNodes(initialized);
  }, [nodes, dimensions]);

  // Force-directed layout simulation
  useEffect(() => {
    if (graphNodes.length === 0) return;

    const simulate = () => {
      const newNodes = [...graphNodes];
      
      // Apply forces
      for (let i = 0; i < newNodes.length; i++) {
        const node = newNodes[i];
        if (!node.x || !node.y) continue;
        
        let fx = 0, fy = 0;
        
        // Repulsion from other nodes
        for (let j = 0; j < newNodes.length; j++) {
          if (i === j) continue;
          const other = newNodes[j];
          if (!other.x || !other.y) continue;
          
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1000 / (dist * dist);
          
          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
        }
        
        // Attraction along edges
        edges.forEach(edge => {
          const sourceId = edge.source.replace('sc_', '').replace('concept_', '');
          const targetId = edge.target.replace('sc_', '').replace('concept_', '');
          
          if (node.id === sourceId || node.id === targetId) {
            const otherId = node.id === sourceId ? targetId : sourceId;
            const other = newNodes.find(n => n.id === otherId);
            if (other?.x && other?.y && node.x && node.y) {
              const dx = other.x - node.x;
              const dy = other.y - node.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              
              fx += dx * 0.01;
              fy += dy * 0.01;
            }
          }
        });
        
        // Center gravity
        fx += (dimensions.width / 2 - node.x) * 0.001;
        fy += (dimensions.height / 2 - node.y) * 0.001;
        
        // Update velocity with damping
        node.vx = (node.vx || 0) * 0.9 + fx * 0.1;
        node.vy = (node.vy || 0) * 0.9 + fy * 0.1;
        
        // Update position (skip if dragging this node)
        if (dragNode.current?.id !== node.id) {
          node.x += node.vx;
          node.y += node.vy;
          
          // Boundary constraints
          node.x = Math.max(40, Math.min(dimensions.width - 40, node.x));
          node.y = Math.max(40, Math.min(dimensions.height - 40, node.y));
        }
      }
      
      setGraphNodes(newNodes);
      animationRef.current = requestAnimationFrame(simulate);
    };
    
    animationRef.current = requestAnimationFrame(simulate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [graphNodes.length, edges, dimensions]);

  // Draw the graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    // Draw edges
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    edges.forEach(edge => {
      const sourceId = edge.source.replace('sc_', '').replace('concept_', '');
      const targetId = edge.target.replace('sc_', '').replace('concept_', '');
      
      const source = graphNodes.find(n => n.id === sourceId);
      const target = graphNodes.find(n => n.id === targetId);
      
      if (source?.x && source?.y && target?.x && target?.y) {
        const isHighlighted = hoveredNode === sourceId || hoveredNode === targetId ||
                             selectedNode === sourceId || selectedNode === targetId;
        
        ctx.beginPath();
        ctx.strokeStyle = isHighlighted ? '#424242' : '#e0e0e0';
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    });
    
    // Draw nodes
    graphNodes.forEach(node => {
      if (!node.x || !node.y) return;
      
      const isHovered = hoveredNode === node.id;
      const isSelected = selectedNode === node.id;
      const radius = node.type === 'syscall' ? 20 : 15;
      const color = CLUSTER_COLORS[node.cluster] || '#424242';
      
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + (isHovered || isSelected ? 3 : 0), 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#1a1a1a' : color;
      ctx.fill();
      
      if (isHovered || isSelected) {
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = `${isHovered || isSelected ? 'bold ' : ''}10px "IBM Plex Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const label = node.label.length > 8 ? node.label.substring(0, 7) + '..' : node.label;
      ctx.fillText(label, node.x, node.y);
    });
    
    // Draw legend
    ctx.font = '11px "IBM Plex Sans", sans-serif';
    ctx.textAlign = 'left';
    let legendY = 20;
    
    Object.entries(CLUSTER_COLORS).forEach(([cluster, color]) => {
      ctx.fillStyle = color;
      ctx.fillRect(10, legendY - 6, 12, 12);
      ctx.fillStyle = '#424242';
      ctx.fillText(cluster.replace('_', ' '), 28, legendY);
      legendY += 18;
    });
    
  }, [graphNodes, edges, hoveredNode, selectedNode, dimensions]);

  // Mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDragging.current && dragNode.current) {
      const node = graphNodes.find(n => n.id === dragNode.current?.id);
      if (node) {
        node.x = x;
        node.y = y;
        node.vx = 0;
        node.vy = 0;
        setGraphNodes([...graphNodes]);
      }
      return;
    }
    
    // Find hovered node
    const hovered = graphNodes.find(node => {
      if (!node.x || !node.y) return false;
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });
    
    setHoveredNode(hovered?.id || null);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNode) {
      isDragging.current = true;
      dragNode.current = graphNodes.find(n => n.id === hoveredNode) || null;
    }
  };

  const handleMouseUp = () => {
    if (isDragging.current && dragNode.current && onNodeClick) {
      // Only trigger click if we didn't drag much
    }
    isDragging.current = false;
    dragNode.current = null;
  };

  const handleClick = () => {
    if (hoveredNode && onNodeClick && !isDragging.current) {
      onNodeClick(hoveredNode);
    }
  };

  return (
    <div className="border-2 border-bauhaus-black bg-bauhaus-white">
      <div className="p-3 border-b-2 border-bauhaus-black flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-bauhaus-yellow"></div>
          <span className="font-semibold text-sm uppercase tracking-wider">Knowledge Graph</span>
        </div>
        <span className="text-xs text-bauhaus-dark-gray font-mono">
          {graphNodes.length} nodes | {edges.length} connections
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        className="block"
      />
      {hoveredNode && (
        <div className="p-2 border-t-2 border-bauhaus-black bg-bauhaus-gray">
          <span className="font-mono text-sm">{hoveredNode}</span>
          <span className="text-xs text-bauhaus-dark-gray ml-2">Click to view details</span>
        </div>
      )}
    </div>
  );
}

export default KnowledgeGraph;
