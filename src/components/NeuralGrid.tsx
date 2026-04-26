import React, { useEffect, useRef, useState } from 'react';
import { NeuralEngine, Edge, Cluster, InternalMarker, GhostTrace, SystemDNA, CyclePhase, Stats } from '../engine/Core';
import { motion, AnimatePresence } from 'motion/react';
import { AudioInput } from '../engine/AudioInputEngine';

interface NeuralGridProps {
  onStateUpdate?: (data: Stats) => void;
}

export const NeuralGrid: React.FC<NeuralGridProps> = ({ onStateUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NeuralEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredFragment, setHoveredFragment] = useState<{ x: number; y: number; text: string } | null>(null);

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

    const handlePerturb = () => {
      if (engineRef.current) {
        engineRef.current.addNode(Math.random() * engineRef.current.width, Math.random() * engineRef.current.height);
      }
    };
    window.addEventListener('perturb-field', handlePerturb);

    return () => {
        observer.disconnect();
        window.removeEventListener('perturb-field', handlePerturb);
    };
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
      const audioData = AudioInput.getAudioData();
      engine.update(dt, time / 1000, audioData.volume);

      // Report state periodically
      if (Math.random() < 0.05) {
        const edges = Array.from(engine.edges.values());
        onStateUpdate?.({
          nodeCount: engine.nodes.length,
          edgeCount: edges.length,
          avgStrength: edges.length > 0 ? (edges as Edge[]).reduce((acc: number, e: Edge) => acc + e.strength, 0) / edges.length : 0,
          clusters: engine.clusters,
          markers: engine.markers,
          ghosts: engine.ghosts,
          dna: engine.dna,
          phase: engine.phase,
          events: engine.popEvents(),
          phaseDominance: engine.getPhaseDominance(),
          ghostCount: engine.ghosts.length,
          redFlags: engine.getAuditStats().red_flags,
          audit: engine.getAuditStats(),
          lastPrune: engine.getLastPrune(),
          fossilRecord: engine.getFossilRecord()
        });
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Cathedral Lattice & Memory Residue
      
      const latticePoints: typeof engine.ghosts = [];

      engine.ghosts.forEach(ghost => {
        const isStructural = ghost.energy < 0.2;

        if (isStructural) {
          latticePoints.push(ghost);
          // Tiny sharp points for structural memory
          ctx.fillStyle = `rgba(34, 211, 238, ${0.1 + ghost.energy})`;
          ctx.beginPath();
          ctx.arc(ghost.x, ghost.y, 1, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Blooming residue for active ghosts
          const glowSize = ghost.energy * 30;
          const gradient = ctx.createRadialGradient(ghost.x, ghost.y, 0, ghost.x, ghost.y, glowSize);
          gradient.addColorStop(0, `rgba(99, 102, 241, ${ghost.energy * 0.15})`);
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(ghost.x, ghost.y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      if (latticePoints.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(34, 211, 238, 0.05)`;
        ctx.lineWidth = 0.5;
        // Connect nearby structural ghosts
        for (let i = 0; i < latticePoints.length; i++) {
          const p1 = latticePoints[i];
          // Connect to next 3 points to form web
          for (let j = i + 1; j < Math.min(i + 4, latticePoints.length); j++) {
            const p2 = latticePoints[j];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            if (dx * dx + dy * dy < 4000) { // ~63px radius
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
            }
          }
        }
        ctx.stroke();
      }

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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !engineRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find closest structural ghost with fragment
    let closestGhost = null;
    let minD = 20; // 20px hover radius

    for (const ghost of engineRef.current.ghosts) {
      if (ghost.energy < 0.2 && ghost.fragment) {
        const dx = ghost.x - x;
        const dy = ghost.y - y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < minD) {
          minD = d;
          closestGhost = ghost;
        }
      }
    }

    if (closestGhost) {
      setHoveredFragment({ x: closestGhost.x, y: closestGhost.y, text: closestGhost.fragment! });
    } else {
      setHoveredFragment(null);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-transparent relative overflow-hidden cursor-crosshair">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredFragment(null)}
      />
      
      <AnimatePresence>
        {hoveredFragment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-50 pointer-events-none"
            style={{ 
              left: hoveredFragment.x + 15, 
              top: hoveredFragment.y - 15 
            }}
          >
            <div className="bg-black/80 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded text-left">
              <p className="text-[9px] font-mono uppercase text-cyan-500/70 mb-0.5">Fossilized Core</p>
              <p className="text-xs text-white tracking-widest">{hoveredFragment.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

