import React, { useEffect, useRef, useState } from 'react';
import { NeuralEngine, Edge, Cluster, InternalMarker, GhostTrace } from '../engine/Core';

interface NeuralGridProps {
  onStateUpdate?: (data: { 
    nodeCount: number; 
    edgeCount: number; 
    avgStrength: number;
    clusters: Cluster[];
    markers: InternalMarker[];
    ghosts: GhostTrace[];
  }) => void;
}

export const NeuralGrid: React.FC<NeuralGridProps> = ({ onStateUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NeuralEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        if (engineRef.current) {
          engineRef.current.width = width;
          engineRef.current.height = height;
        } else {
          engineRef.current = new NeuralEngine(width, height, 50);
        }
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !engineRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const engine = engineRef.current!;
      engine.update(dt, time / 1000);

      // Report state periodically
      if (Math.random() < 0.05) {
        const edges = Array.from(engine.edges.values());
        onStateUpdate?.({
          nodeCount: engine.nodes.length,
          edgeCount: edges.length,
          avgStrength: edges.length > 0 ? (edges as Edge[]).reduce((acc: number, e: Edge) => acc + e.strength, 0) / edges.length : 0,
          clusters: engine.clusters,
          markers: engine.markers,
          ghosts: engine.ghosts
        });
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ghosts (Memory Residue)
      engine.ghosts.forEach(ghost => {
        const glowSize = ghost.energy * 30;
        const gradient = ctx.createRadialGradient(ghost.x, ghost.y, 0, ghost.x, ghost.y, glowSize);
        gradient.addColorStop(0, `rgba(99, 102, 241, ${ghost.energy * 0.1})`); // Indigo shadow
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ghost.x, ghost.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw edges
      engine.edges.forEach((edge) => {
        const from = engine.nodes.find(n => n.id === edge.fromId);
        const to = engine.nodes.find(n => n.id === edge.toId);
        if (!from || !to) return;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        
        const opacity = edge.strength * 0.2 + edge.activity * 0.4;
        ctx.strokeStyle = `rgba(34, 211, 238, ${opacity})`;
        ctx.lineWidth = 0.5 + edge.strength * 1.5;
        ctx.stroke();
      });

      // Draw nodes
      engine.nodes.forEach(node => {
        const size = 2 + node.energy * 3;
        const glowSize = node.energy * 15;

        // Glow
        if (node.energy > 0.1) {
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowSize);
          gradient.addColorStop(0, `rgba(34, 211, 238, ${node.energy * 0.4})`);
          gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(165, 243, 252, ${0.4 + node.energy * 0.6})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions, onStateUpdate]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || !engineRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    engineRef.current.addNode(x, y);
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-transparent relative overflow-hidden cursor-crosshair">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block"
        onClick={handleCanvasClick}
      />
    </div>
  );
};

