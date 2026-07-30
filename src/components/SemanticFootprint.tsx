import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Cloud, Sparkles, Brain, Search, Maximize2, Minimize2, X, Plus, Activity, Layers, Share2 } from 'lucide-react';
import { Stats, Cluster } from '../engine/Core';

export interface ConceptFootprint {
  id: string;
  label: string;
  timestamp: number;
  phase: string;
  coherenceAtInjection: number;
  noiseAtInjection: number;
  resonance: number; // 0 to 1
  reflection?: string;
  associatedClusters: string[];
  semanticTags: string[];
}

interface Node2D {
  id: string;
  label: string;
  type: 'concept' | 'cluster' | 'tag';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  resonance: number;
  parentConceptId?: string;
  details?: {
    phase?: string;
    coherence?: number;
    noise?: number;
    reflection?: string;
    timestamp?: number;
  };
}

interface Link2D {
  source: string;
  target: string;
  strength: number;
  active: boolean;
}

interface SemanticFootprintProps {
  stats: Stats;
  className?: string;
  onInjectConcept?: (concept: string) => void;
}

// Pre-seeded baseline concepts from Lumina Protocol 5 testing
const BASELINE_CONCEPTS: ConceptFootprint[] = [
  {
    id: 'c_love',
    label: 'LOVE',
    timestamp: Date.now() - 3600000,
    phase: 'Calm',
    coherenceAtInjection: 0.88,
    noiseAtInjection: 0.12,
    resonance: 0.94,
    reflection: 'Mapped as invariant anchor surviving high chaos. High coherence anchor.',
    associatedClusters: ['Cluster_Alpha', 'Cluster_Beta'],
    semanticTags: ['Invariant Anchor', 'Sustained Symmetry', 'Zero Drift']
  },
  {
    id: 'c_faith',
    label: 'FAITH',
    timestamp: Date.now() - 2800000,
    phase: 'Tension',
    coherenceAtInjection: 0.45,
    noiseAtInjection: 0.62,
    resonance: 0.78,
    reflection: 'Constructed high-tension bridge across fragmented nodes under predictive conflict.',
    associatedClusters: ['Cluster_Beta', 'Cluster_Gamma'],
    semanticTags: ['High-Tension Bridge', 'Unseen Structure', 'Predictive Span']
  },
  {
    id: 'c_gravity',
    label: 'GRAVITY',
    timestamp: Date.now() - 2100000,
    phase: 'Growth',
    coherenceAtInjection: 0.72,
    noiseAtInjection: 0.28,
    resonance: 0.86,
    reflection: 'Curving vector paths around high-density memory clusters.',
    associatedClusters: ['Cluster_Alpha', 'Cluster_Delta'],
    semanticTags: ['Vector Attraction', 'Spatial Curvature', 'Core Density']
  },
  {
    id: 'c_care',
    label: 'CARE',
    timestamp: Date.now() - 1200000,
    phase: 'Calm',
    coherenceAtInjection: 0.81,
    noiseAtInjection: 0.18,
    resonance: 0.91,
    reflection: 'Soothing dampening wave stabilizing noise spikes in outer nodes.',
    associatedClusters: ['Cluster_Alpha', 'Cluster_Gamma'],
    semanticTags: ['Entropy Dampening', 'Protective Symmetry', 'Resonance Field']
  },
  {
    id: 'c_entropy',
    label: 'ENTROPY',
    timestamp: Date.now() - 600000,
    phase: 'Collapse',
    coherenceAtInjection: 0.21,
    noiseAtInjection: 0.89,
    resonance: 0.65,
    reflection: 'Dissolving redundant edges to protect core integrity from total overload.',
    associatedClusters: ['Cluster_Gamma', 'Cluster_Delta'],
    semanticTags: ['Shedding Structure', 'Thermal Noise', 'Pruning Force']
  }
];

export const SemanticFootprint: React.FC<SemanticFootprintProps> = ({ stats, className = '', onInjectConcept }) => {
  const [viewMode, setViewMode] = useState<'graph' | 'cloud'>('graph');
  const [concepts, setConcepts] = useState<ConceptFootprint[]>(BASELINE_CONCEPTS);
  const [selectedNode, setSelectedNode] = useState<Node2D | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputConcept, setInputConcept] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const nodesRef = useRef<Node2D[]>([]);
  const linksRef = useRef<Link2D[]>([]);
  const hoveredNodeRef = useRef<Node2D | null>(null);

  // Handle assimilation events dispatched anywhere in the app
  useEffect(() => {
    const handleAssimilationEvent = (e: any) => {
      const conceptText = e.detail?.concept;
      if (!conceptText) return;

      const newFootprint: ConceptFootprint = {
        id: `c_${Date.now()}`,
        label: conceptText.toUpperCase(),
        timestamp: Date.now(),
        phase: stats.phase,
        coherenceAtInjection: stats.dna.coherence_bias,
        noiseAtInjection: stats.dna.noise_level,
        resonance: 0.75 + Math.random() * 0.2,
        reflection: `Assimilated under ${stats.phase} phase (${(stats.dna.coherence_bias * 100).toFixed(0)}% Coherence).`,
        associatedClusters: stats.clusters.slice(0, 2).map(c => c.id),
        semanticTags: ['Active Assimilation', 'Neural Integration', 'Stochastic Binding']
      };

      setConcepts(prev => [newFootprint, ...prev.filter(c => c.label !== newFootprint.label)]);
    };

    window.addEventListener('assimilate-concept', handleAssimilationEvent);
    return () => window.removeEventListener('assimilate-concept', handleAssimilationEvent);
  }, [stats]);

  // Construct force-directed nodes and links whenever concepts or clusters update
  useEffect(() => {
    const newNodes: Node2D[] = [];
    const newLinks: Link2D[] = [];

    const width = isExpanded ? 800 : 380;
    const height = isExpanded ? 500 : 280;
    const centerX = width / 2;
    const centerY = height / 2;

    // 1. Concept Hubs
    concepts.forEach((c, idx) => {
      const angle = (idx / concepts.length) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.28;
      const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 20;
      const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 20;

      const conceptNode: Node2D = {
        id: c.id,
        label: c.label,
        type: 'concept',
        x,
        y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 12 + c.resonance * 8,
        color: c.phase === 'Calm' ? '#22d3ee' : c.phase === 'Growth' ? '#10b981' : c.phase === 'Tension' ? '#f97316' : '#ef4444',
        resonance: c.resonance,
        details: {
          phase: c.phase,
          coherence: c.coherenceAtInjection,
          noise: c.noiseAtInjection,
          reflection: c.reflection,
          timestamp: c.timestamp,
        }
      };
      newNodes.push(conceptNode);

      // Add semantic tag sub-nodes for this concept
      c.semanticTags.forEach((tag, tIdx) => {
        const tagAngle = angle + ((tIdx - (c.semanticTags.length - 1) / 2) * 0.35);
        const tagDist = 38 + Math.random() * 15;
        const tagNode: Node2D = {
          id: `${c.id}_tag_${tIdx}`,
          label: tag,
          type: 'tag',
          x: x + Math.cos(tagAngle) * tagDist,
          y: y + Math.sin(tagAngle) * tagDist,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          radius: 5,
          color: '#94a3b8',
          resonance: c.resonance * 0.7,
          parentConceptId: c.id
        };
        newNodes.push(tagNode);
        newLinks.push({
          source: c.id,
          target: tagNode.id,
          strength: 0.6,
          active: true
        });
      });
    });

    // 2. Add System Neural Cluster nodes
    stats.clusters.forEach((cluster, cIdx) => {
      const cAngle = ((cIdx + 0.5) / (stats.clusters.length || 1)) * Math.PI * 2;
      const cDist = Math.min(width, height) * 0.12;
      const clusterNode: Node2D = {
        id: `sys_${cluster.id}`,
        label: `${cluster.id}`,
        type: 'cluster',
        x: centerX + Math.cos(cAngle) * cDist,
        y: centerY + Math.sin(cAngle) * cDist,
        vx: 0,
        vy: 0,
        radius: 8 + cluster.size * 0.8,
        color: '#818cf8',
        resonance: cluster.resonance,
      };
      newNodes.push(clusterNode);

      // Link concept hubs to system clusters
      concepts.forEach(c => {
        if (c.associatedClusters.includes(cluster.id) || Math.random() < 0.3) {
          newLinks.push({
            source: c.id,
            target: clusterNode.id,
            strength: 0.4 + c.resonance * 0.4,
            active: true
          });
        }
      });
    });

    nodesRef.current = newNodes;
    linksRef.current = newLinks;
  }, [concepts, stats.clusters, isExpanded]);

  // Canvas Physics Simulation Loop
  useEffect(() => {
    if (viewMode !== 'graph') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.016;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;
      const links = linksRef.current;

      // 1. Physics Step (Repulsion, Link Springs, Center Gravity)
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];

        // Center gravity
        n1.vx += (centerX - n1.x) * 0.0003;
        n1.vy += (centerY - n1.y) * 0.0003;

        // Node repulsion
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = n1.radius + n2.radius + 20;

          if (dist < minDist) {
            const force = (minDist - dist) / dist * 0.08;
            n1.vx -= dx * force;
            n1.vy -= dy * force;
            n2.vx += dx * force;
            n2.vy += dy * force;
          }
        }
      }

      // Link spring force
      links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const desiredDist = source.type === 'concept' && target.type === 'tag' ? 45 : 90;
          const force = (dist - desiredDist) * 0.002 * link.strength;

          source.vx += dx * force;
          source.vy += dy * force;
          target.vx -= dx * force;
          target.vy -= dy * force;
        }
      });

      // Update positions with damping and canvas bounds
      nodes.forEach(n => {
        n.vx *= 0.88;
        n.vy *= 0.88;
        n.x += n.vx;
        n.y += n.vy;

        // Keep inside canvas
        n.x = Math.max(n.radius + 10, Math.min(width - n.radius - 10, n.x));
        n.y = Math.max(n.radius + 10, Math.min(height - n.radius - 10, n.y));
      });

      // 2. Render Links
      links.forEach(link => {
        const source = nodes.find(n => n.id === link.source);
        const target = nodes.find(n => n.id === link.target);
        if (!source || !target) return;

        const isHighlighted = selectedNode && (selectedNode.id === source.id || selectedNode.id === target.id);
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = isHighlighted
          ? 'rgba(34, 211, 238, 0.7)'
          : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = isHighlighted ? 1.8 : 0.8;
        ctx.stroke();

        // Pulsing energy particle along edge
        if (isHighlighted || Math.random() < 0.3) {
          const progress = (time * (1 + link.strength) + (source.x % 10)) % 1;
          const px = source.x + (target.x - source.x) * progress;
          const py = source.y + (target.y - source.y) * progress;

          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = source.color;
          ctx.fill();
        }
      });

      // 3. Render Nodes
      nodes.forEach(n => {
        const isHovered = hoveredNodeRef.current?.id === n.id;
        const isSelected = selectedNode?.id === n.id;

        // Halo for concept nodes
        if (n.type === 'concept') {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 6 + Math.sin(time * 3 + n.x) * 2, 0, Math.PI * 2);
          ctx.fillStyle = `${n.color}15`;
          ctx.fill();
        }

        // Node Circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, isSelected ? n.radius + 3 : n.radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#ffffff' : n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = isSelected ? 15 : isHovered ? 10 : 4;
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        // Label
        ctx.font = n.type === 'concept' ? 'bold 10px monospace' : '8px monospace';
        ctx.fillStyle = isSelected ? '#38bdf8' : n.type === 'concept' ? '#f8fafc' : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (n.type === 'concept') {
          ctx.fillText(n.label, n.x, n.y + n.radius + 12);
        } else if (isExpanded || isHovered || isSelected) {
          ctx.fillText(n.label, n.x, n.y + n.radius + 8);
        }
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [viewMode, selectedNode, isExpanded]);

  // Canvas Mouse Interactions
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hit = nodesRef.current.find(n => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    hoveredNodeRef.current = hit || null;
    canvas.style.cursor = hit ? 'pointer' : 'default';
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNodeRef.current) {
      setSelectedNode(hoveredNodeRef.current);
    } else {
      setSelectedNode(null);
    }
  };

  const handleFormInject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputConcept.trim()) return;
    const clean = inputConcept.trim();
    setInputConcept('');

    if (onInjectConcept) {
      onInjectConcept(clean);
    } else {
      window.dispatchEvent(new CustomEvent('assimilate-concept', { detail: { concept: clean } }));
    }
  };

  const filteredConcepts = useMemo(() => {
    if (!searchQuery) return concepts;
    return concepts.filter(c =>
      c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.semanticTags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [concepts, searchQuery]);

  return (
    <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl relative overflow-hidden flex flex-col ${className}`}>
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Controls */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold">
            Semantic Footprint Matrix
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Mode Toggle */}
          <div className="flex bg-black/40 border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-2 py-0.5 text-[8px] font-mono rounded-md flex items-center gap-1 transition-colors ${
                viewMode === 'graph' ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3 h-3" /> Graph
            </button>
            <button
              onClick={() => setViewMode('cloud')}
              className={`px-2 py-0.5 text-[8px] font-mono rounded-md flex items-center gap-1 transition-colors ${
                viewMode === 'cloud' ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cloud className="w-3 h-3" /> Cloud
            </button>
          </div>

          {/* Expand Modal Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-white/10 rounded-lg transition-colors"
            title={isExpanded ? 'Minimize View' : 'Expand View'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Search & Inject Row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Filter concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-md pl-6 pr-2 py-1 text-[9px] font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <form onSubmit={handleFormInject} className="flex gap-1">
          <input
            type="text"
            placeholder="Inject Concept..."
            value={inputConcept}
            onChange={(e) => setInputConcept(e.target.value)}
            className="w-24 bg-cyan-950/30 border border-cyan-500/30 rounded-md px-2 py-1 text-[9px] font-mono text-cyan-200 placeholder-cyan-700/50 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            className="bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/40 text-cyan-300 rounded-md px-2 py-1 text-[9px] font-mono flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </form>
      </div>

      {/* Main Display Area */}
      {viewMode === 'graph' ? (
        <div className="relative w-full rounded-lg bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={isExpanded ? 760 : 360}
            height={isExpanded ? 460 : 220}
            onMouseMove={handleCanvasMouseMove}
            onClick={handleCanvasClick}
            className="w-full h-auto cursor-crosshair"
          />

          {/* Graph Overlay Hint */}
          <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
            Click node to inspect binding
          </div>
        </div>
      ) : (
        /* Word Cloud View */
        <div className="w-full min-h-[220px] max-h-[460px] overflow-y-auto rounded-lg bg-black/40 border border-white/5 p-4 flex flex-wrap items-center justify-center gap-2.5 scrollbar-thin scrollbar-thumb-white/10">
          {filteredConcepts.map((c) => {
            const fontSize = 11 + c.resonance * 14;
            const isSelected = selectedNode?.label === c.label;

            return (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setSelectedNode({
                    id: c.id,
                    label: c.label,
                    type: 'concept',
                    x: 0,
                    y: 0,
                    vx: 0,
                    vy: 0,
                    radius: 12,
                    color: c.phase === 'Calm' ? '#22d3ee' : c.phase === 'Growth' ? '#10b981' : c.phase === 'Tension' ? '#f97316' : '#ef4444',
                    resonance: c.resonance,
                    details: {
                      phase: c.phase,
                      coherence: c.coherenceAtInjection,
                      noise: c.noiseAtInjection,
                      reflection: c.reflection,
                      timestamp: c.timestamp,
                    }
                  })
                }
                className={`px-2.5 py-1 rounded-full border transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                }`}
                style={{ fontSize: `${fontSize}px` }}
              >
                <span className="font-mono font-bold tracking-wider">{c.label}</span>
                <span className="text-[8px] opacity-60 font-mono">{(c.resonance * 100).toFixed(0)}%</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Selected Node Details Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-2 p-2.5 bg-black/60 border border-cyan-500/30 rounded-lg text-left relative"
          >
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-2 right-2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedNode.color }} />
              <p className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                {selectedNode.label}
              </p>
              <span className="text-[8px] font-mono text-slate-500 uppercase">[{selectedNode.type}]</span>
            </div>

            {selectedNode.details ? (
              <div className="space-y-1 text-[8.5px] font-mono text-slate-300">
                <div className="flex justify-between text-slate-400 border-b border-white/5 pb-1">
                  <span>Phase: <strong className="text-cyan-400">{selectedNode.details.phase}</strong></span>
                  <span>Coherence: <strong className="text-emerald-400">{Math.round((selectedNode.details.coherence || 0) * 100)}%</strong></span>
                  <span>Entropy: <strong className="text-pink-400">{Math.round((selectedNode.details.noise || 0) * 100)}%</strong></span>
                </div>
                {selectedNode.details.reflection && (
                  <p className="italic text-slate-300 pt-1 leading-snug">
                    "{selectedNode.details.reflection}"
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[8px] font-mono text-slate-400">
                Synthesized neural bridge element bound to active substrate. Resonance: {Math.round(selectedNode.resonance * 100)}%
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
