import React, { useEffect, useRef, useState } from 'react';
import { NeuralEngine, Edge, Cluster, InternalMarker, GhostTrace, SystemDNA, CyclePhase, Stats, MEMORY_FRAGMENTS } from '../engine/Core';
import { motion, AnimatePresence } from 'motion/react';
import { AudioInput } from '../engine/AudioInputEngine';
import { Sparkles, Brain, RefreshCw } from 'lucide-react';

interface NeuralGridProps {
  onStateUpdate?: (data: Stats) => void;
}

interface ActiveEcho {
  id: string;
  x: number;
  y: number;
  label: string;
  text: string;
  duration: number; // in seconds
  elapsed: number;
  driftX: number;
  driftY: number;
}

export const NeuralGrid: React.FC<NeuralGridProps> = ({ onStateUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NeuralEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredFragment, setHoveredFragment] = useState<{ x: number; y: number; text: string } | null>(null);
  const [echoesActive, setEchoesActive] = useState<boolean>(true);

  const activeEchoesRef = useRef<ActiveEcho[]>([]);
  const lastEchoTimeRef = useRef<number>(0);

  // Helper to spawn a new Cognitive Echo from fossil records or memory fragments
  const spawnCognitiveEcho = (overrideText?: string, customX?: number, customY?: number) => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    const width = engine.width || 800;
    const height = engine.height || 600;

    const fossilRecord = engine.getFossilRecord();
    const ghostTraces = engine.ghosts.filter(g => g.fragment);

    let label = 'RECOVERED MEMORY';
    let text = '';

    if (overrideText) {
      text = overrideText;
      label = 'USER RECALL';
    } else if (fossilRecord.length > 0 && Math.random() < 0.45) {
      const rec = fossilRecord[Math.floor(Math.random() * fossilRecord.length)];
      const prunedCount = Math.max(1, rec.ghost_count_before - rec.ghost_count_after);
      const options = [
        `Archived ${prunedCount} ghost traces under ${rec.trigger}`,
        `Compaction [${rec.compaction_type}]: ${rec.continuity_impact} continuity impact`,
        `Fossilized under ${rec.threshold_state} threshold state`,
        `Protocol ${rec.protocol}: Contradiction ${rec.contradiction_impact}`
      ];
      text = options[Math.floor(Math.random() * options.length)];
      label = `FOSSIL RECORD #${rec.event_id.slice(-4)}`;
    } else if (ghostTraces.length > 0 && Math.random() < 0.5) {
      const ghost = ghostTraces[Math.floor(Math.random() * ghostTraces.length)];
      text = ghost.fragment || 'ghost trace echo';
      label = 'SUBCONSCIOUS ECHO';
    } else {
      const randFrag = MEMORY_FRAGMENTS[Math.floor(Math.random() * MEMORY_FRAGMENTS.length)];
      text = randFrag;
      label = 'EMERGENT MEMORY';
    }

    // Pick coordinates near a node or random inside grid
    let x = customX ?? (width * 0.15 + Math.random() * width * 0.7);
    let y = customY ?? (height * 0.2 + Math.random() * height * 0.6);

    if (!customX && engine.nodes.length > 0 && Math.random() < 0.6) {
      const randomNode = engine.nodes[Math.floor(Math.random() * engine.nodes.length)];
      x = Math.max(80, Math.min(width - 200, randomNode.x + (Math.random() - 0.5) * 60));
      y = Math.max(60, Math.min(height - 60, randomNode.y + (Math.random() - 0.5) * 60));
    }

    const newEcho: ActiveEcho = {
      id: `echo_${Date.now()}_${Math.random()}`,
      x,
      y,
      label,
      text: text.length > 60 ? text.slice(0, 58) + '...' : text,
      duration: 3.8 + Math.random() * 2.0,
      elapsed: 0,
      driftX: (Math.random() - 0.5) * 0.6,
      driftY: -0.4 - Math.random() * 0.5 // gently float upward
    };

    activeEchoesRef.current.push(newEcho);
    // Keep at most 4 echoes simultaneously
    if (activeEchoesRef.current.length > 4) {
      activeEchoesRef.current.shift();
    }
  };

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
        spawnCognitiveEcho("Perturbation wave injected into field");
      }
    };

    const handleAddDormant = () => {
      if (engineRef.current) {
        engineRef.current.addDormantNode(Math.random() * engineRef.current.width, Math.random() * engineRef.current.height);
        spawnCognitiveEcho("Dormant node awakened from long inertia");
      }
    };

    const handleToggleRecursive = (e: any) => {
      if (engineRef.current && e.detail) {
        engineRef.current.toggleRecursiveLearning(e.detail.active);
      }
    };

    const handleApplyRecursive = (e: any) => {
      if (engineRef.current && e.detail) {
        engineRef.current.applyRecursiveAdjustment(
          e.detail.label,
          e.detail.explanation,
          e.detail.adjustments,
          e.detail.type
        );
      }
    };

    window.addEventListener('perturb-field', handlePerturb);
    window.addEventListener('add-dormant-node', handleAddDormant);
    window.addEventListener('toggle-recursive-learning', handleToggleRecursive);
    window.addEventListener('apply-recursive-adjustment', handleApplyRecursive);

    return () => {
        observer.disconnect();
        window.removeEventListener('perturb-field', handlePerturb);
        window.removeEventListener('add-dormant-node', handleAddDormant);
        window.removeEventListener('toggle-recursive-learning', handleToggleRecursive);
        window.removeEventListener('apply-recursive-adjustment', handleApplyRecursive);
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
      const dt = lastTime === 0 ? 0.016 : Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      const engine = engineRef.current!;
      const audioData = AudioInput.getAudioData();
      engine.update(dt, time / 1000, audioData.volume);

      // Periodically spawn Cognitive Echoes every ~5.5 seconds if enabled
      if (echoesActive && time - lastEchoTimeRef.current > 5500) {
        lastEchoTimeRef.current = time;
        spawnCognitiveEcho();
      }

      // Update active echoes time
      activeEchoesRef.current.forEach(echo => {
        echo.elapsed += dt;
      });
      // Filter expired
      activeEchoesRef.current = activeEchoesRef.current.filter(e => e.elapsed < e.duration);

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
          fossilRecord: engine.getFossilRecord(),
          anomalySnapshots: engine.getAnomalySnapshots(),
          recursive: engine.getRecursiveState()
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

      // Compute Phase-Synchronized Visual Offsets for Nodes (Breathing in Calm, Jittering in Tension)
      const centerX = (canvas.width || 800) / 2;
      const centerY = (canvas.height || 600) / 2;
      const tSec = time / 1000;
      const phase = engine.phase;

      const nodeRenderMap = new Map<string, { x: number; y: number; breathGlow: number }>();

      engine.nodes.forEach(node => {
        const dx = node.x - centerX;
        const dy = node.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let rx = node.x;
        let ry = node.y;
        let breathGlow = 1;

        if (phase === 'Calm') {
          // Rhythmic, gentle breathing expansion and contraction
          const breath = Math.sin(tSec * 1.5) * 0.038 + Math.sin(tSec * 0.75) * 0.012;
          rx = centerX + dx * (1 + breath);
          ry = centerY + dy * (1 + breath);
          breathGlow = 1 + breath * 3.5;
        } else if (phase === 'Tension') {
          // Rapid, erratic jitter and micro-tremors during tension
          const jitterMag = 1.8 + (engine.dna.noise_level || 0.3) * 2.2;
          const jX = Math.sin(tSec * 42 + node.x * 0.08) * jitterMag + (Math.random() - 0.5) * 1.2;
          const jY = Math.cos(tSec * 45 + node.y * 0.08) * jitterMag + (Math.random() - 0.5) * 1.2;
          rx = node.x + jX;
          ry = node.y + jY;
          breathGlow = 0.85 + Math.random() * 0.35;
        } else if (phase === 'Growth') {
          // Rhythmic outward pulse waves
          const wave = Math.sin(tSec * 3.2 - dist * 0.012) * 0.028;
          rx = centerX + dx * (1 + wave);
          ry = centerY + dy * (1 + wave);
          breathGlow = 1 + Math.max(0, wave) * 4.5;
        } else if (phase === 'Collapse') {
          // Turbulent contraction & shudder
          const contract = Math.sin(tSec * 8.0) * 0.04 - 0.025;
          const shudderX = (Math.random() - 0.5) * 2.8;
          const shudderY = (Math.random() - 0.5) * 2.8;
          rx = centerX + dx * (1 + contract) + shudderX;
          ry = centerY + dy * (1 + contract) + shudderY;
          breathGlow = 0.6 + Math.random() * 0.7;
        }

        nodeRenderMap.set(node.id, { x: rx, y: ry, breathGlow });
      });

      // Draw edges
      engine.edges.forEach((edge) => {
        const fromPos = nodeRenderMap.get(edge.fromId) || engine.nodes.find(n => n.id === edge.fromId);
        const toPos = nodeRenderMap.get(edge.toId) || engine.nodes.find(n => n.id === edge.toId);
        if (!fromPos || !toPos) return;

        ctx.beginPath();
        ctx.moveTo(fromPos.x, fromPos.y);
        ctx.lineTo(toPos.x, toPos.y);
        
        const opacity = edge.strength * 0.2 + edge.activity * 0.4;
        ctx.strokeStyle = phase === 'Tension'
          ? `rgba(244, 114, 182, ${opacity * 0.9})`
          : `rgba(34, 211, 238, ${opacity})`;
        ctx.lineWidth = 0.5 + edge.strength * 1.5;
        ctx.stroke();
      });

      // Draw nodes
      engine.nodes.forEach(node => {
        const pos = nodeRenderMap.get(node.id) || { x: node.x, y: node.y, breathGlow: 1 };
        const size = (2 + node.energy * 3) * Math.max(0.7, Math.min(1.4, pos.breathGlow));
        const glowSize = node.energy * 15 * Math.max(0.8, Math.min(1.5, pos.breathGlow));

        // Glow
        if (node.energy > 0.1) {
          const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowSize);
          const color = phase === 'Tension' ? '244, 114, 182' : phase === 'Collapse' ? '236, 72, 153' : '34, 211, 238'; 
          gradient.addColorStop(0, `rgba(${color}, ${node.energy * 0.45})`);
          gradient.addColorStop(1, `rgba(${color}, 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, glowSize, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = phase === 'Tension'
          ? `rgba(244, 114, 182, ${0.5 + node.energy * 0.5})`
          : `rgba(165, 243, 252, ${0.4 + node.energy * 0.6})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render Cognitive Echoes Overlays directly on canvas
      if (echoesActive) {
        activeEchoesRef.current.forEach(echo => {
          const progress = Math.min(1, echo.elapsed / echo.duration);

          // Envelope alpha: fade in first 18%, hold, fade out last 25%
          let alpha = 0;
          if (progress < 0.18) {
            alpha = progress / 0.18;
          } else if (progress > 0.75) {
            alpha = (1 - progress) / 0.25;
          } else {
            alpha = 1;
          }

          const curX = echo.x + echo.driftX * progress * 40;
          const curY = echo.y + echo.driftY * progress * 35;

          ctx.save();
          // Anchor point
          ctx.beginPath();
          ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34, 211, 238, ${alpha * 0.8})`;
          ctx.shadowColor = 'rgba(34, 211, 238, 0.9)';
          ctx.shadowBlur = 6 * alpha;
          ctx.fill();

          // Connective trace line
          ctx.beginPath();
          ctx.moveTo(curX, curY);
          ctx.lineTo(curX + 12, curY - 10);
          ctx.strokeStyle = `rgba(34, 211, 238, ${alpha * 0.35})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Category Badge
          ctx.font = 'bold 8px monospace';
          ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.8})`;
          ctx.fillText(`[ ${echo.label} ]`, curX + 16, curY - 12);

          // Memory Snippet Text
          ctx.font = 'italic 11px monospace';
          ctx.shadowColor = 'rgba(34, 211, 238, 0.9)';
          ctx.shadowBlur = 8 * alpha;
          ctx.fillStyle = `rgba(240, 249, 255, ${alpha * 0.95})`;
          ctx.fillText(`"${echo.text}"`, curX + 16, curY + 2);

          ctx.restore();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions, echoesActive, onStateUpdate]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || !engineRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    engineRef.current.addNode(x, y);

    if (echoesActive && Math.random() < 0.7) {
      spawnCognitiveEcho("Synaptic perturbation at click vector", x, y);
    }
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
      {/* Top Controls Overlay Badge */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setEchoesActive(!echoesActive)}
          className={`px-2.5 py-1 rounded-full border backdrop-blur-md text-[9px] font-mono flex items-center gap-1.5 transition-all ${
            echoesActive
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
              : 'bg-black/50 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Toggle Cognitive Memory Echoes"
        >
          <Sparkles className={`w-3 h-3 ${echoesActive ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
          <span>COGNITIVE ECHOES: {echoesActive ? 'ON' : 'OFF'}</span>
        </button>

        {echoesActive && (
          <button
            onClick={() => spawnCognitiveEcho()}
            className="p-1.5 bg-black/50 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 rounded-full text-slate-400 hover:text-cyan-300 backdrop-blur-md transition-colors"
            title="Trigger Manual Memory Recall"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
      </div>

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


