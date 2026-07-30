import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Activity, Zap, RefreshCw, Maximize2, Minimize2, Sparkles, Brain, Plus, ShieldAlert, Archive, Clock, Search, ArrowDownRight } from 'lucide-react';
import { Stats, CyclePhase } from '../engine/Core';

export interface SemanticConceptRecord {
  id: string;
  label: string;
  timestamp: number; // Injected time in ms
  initialResonance: number; // 0 to 1
  phaseAtInjection: CyclePhase;
  coherenceAtInjection: number;
  noiseAtInjection: number;
  associatedClustersCount: number;
  reflection?: string;
  lastReinforcedAt?: number;
}

export interface DecayPoint {
  timeStr: string;
  timestamp: number;
  avgRelevance: number;
  activeAnchorsCount: number;
  fossilizedCount: number;
  [key: string]: any; // Concept labels dynamically mapped to relevance %
}

interface SemanticDecayTrackerProps {
  stats: Stats;
  className?: string;
}

const STORAGE_KEY = 'lumina_semantic_decay_concepts_v2';
const TRAJECTORY_HISTORY_KEY = 'lumina_semantic_decay_trajectory_v2';

// Baseline seeded concepts if empty
const INITIAL_CONCEPTS: SemanticConceptRecord[] = [
  {
    id: 'sc_love',
    label: 'LOVE',
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    initialResonance: 0.95,
    phaseAtInjection: 'Calm',
    coherenceAtInjection: 0.88,
    noiseAtInjection: 0.12,
    associatedClustersCount: 4,
    reflection: 'Persistent zero-drift anchor surviving predictive turbulence.'
  },
  {
    id: 'sc_faith',
    label: 'FAITH',
    timestamp: Date.now() - 3600000 * 1.2, // 1.2 hours ago
    initialResonance: 0.85,
    phaseAtInjection: 'Tension',
    coherenceAtInjection: 0.52,
    noiseAtInjection: 0.48,
    associatedClustersCount: 3,
    reflection: 'High-tension bridge linking fragmented sub-networks.'
  },
  {
    id: 'sc_gravity',
    label: 'GRAVITY',
    timestamp: Date.now() - 1800000, // 30 mins ago
    initialResonance: 0.90,
    phaseAtInjection: 'Growth',
    coherenceAtInjection: 0.76,
    noiseAtInjection: 0.24,
    associatedClustersCount: 3,
    reflection: 'Spatial curvature field attracting memory fragments.'
  },
  {
    id: 'sc_care',
    label: 'CARE',
    timestamp: Date.now() - 900000, // 15 mins ago
    initialResonance: 0.88,
    phaseAtInjection: 'Calm',
    coherenceAtInjection: 0.82,
    noiseAtInjection: 0.18,
    associatedClustersCount: 2,
    reflection: 'Dampening field softening high-frequency noise spikes.'
  },
  {
    id: 'sc_entropy',
    label: 'ENTROPY',
    timestamp: Date.now() - 300000, // 5 mins ago
    initialResonance: 0.72,
    phaseAtInjection: 'Collapse',
    coherenceAtInjection: 0.25,
    noiseAtInjection: 0.85,
    associatedClustersCount: 1,
    reflection: 'Dissolving redundant edges under high chaos.'
  }
];

export const SemanticDecayTracker: React.FC<SemanticDecayTrackerProps> = ({ stats, className = '' }) => {
  // Load or initialize concept record state
  const [concepts, setConcepts] = useState<SemanticConceptRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_CONCEPTS;
  });

  const [trajectoryHistory, setTrajectoryHistory] = useState<DecayPoint[]>(() => {
    try {
      const saved = localStorage.getItem(TRAJECTORY_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'anchors' | 'fading' | 'fossilized'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newConceptInput, setNewConceptInput] = useState('');
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);

  const lastSnapshotRef = useRef<number>(0);

  // Sync state with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(concepts));
    } catch {
      // ignore
    }
  }, [concepts]);

  // Listen to global concept assimilation events
  useEffect(() => {
    const handleAssimilationEvent = (e: any) => {
      const conceptText = e.detail?.concept;
      if (!conceptText) return;

      const newRec: SemanticConceptRecord = {
        id: `sc_${Date.now()}`,
        label: conceptText.toUpperCase(),
        timestamp: Date.now(),
        initialResonance: 0.95,
        phaseAtInjection: stats.phase,
        coherenceAtInjection: stats.dna.coherence_bias,
        noiseAtInjection: stats.dna.noise_level,
        associatedClustersCount: Math.max(1, Math.floor(stats.clusters.length * 0.75)),
        reflection: `Assimilated under ${stats.phase} phase (${(stats.dna.coherence_bias * 100).toFixed(0)}% Coherence).`
      };

      setConcepts(prev => [newRec, ...prev.filter(c => c.label !== newRec.label)]);
    };

    window.addEventListener('assimilate-concept', handleAssimilationEvent);
    return () => window.removeEventListener('assimilate-concept', handleAssimilationEvent);
  }, [stats]);

  // Real-time Semantic Decay Formula Calculation
  const computeConceptState = (c: SemanticConceptRecord) => {
    const now = Date.now();
    const effectiveBirth = c.lastReinforcedAt || c.timestamp;
    const ageSeconds = Math.max(0, (now - effectiveBirth) / 1000);
    const ageMinutes = ageSeconds / 60;

    // Decay Half-Life factor:
    // High noise level (>0.5) and high prune events accelerate decay; high coherence_bias slows decay.
    const noiseFactor = 1 + (stats.dna.noise_level * 1.8);
    const pruneFactor = 1 + Math.min(2, stats.audit.memory_prune_events * 0.1);
    const coherenceShield = 0.5 + (stats.dna.coherence_bias * 0.8);

    // Half life in minutes (base: 25 mins)
    const halfLifeMins = Math.max(3, (25 * coherenceShield) / (noiseFactor * pruneFactor));

    // Exponential Decay: R(t) = R_0 * 2^(-t / half_life)
    const decayedRatio = Math.pow(0.5, ageMinutes / halfLifeMins);
    const currentRelevance = Math.max(2, Math.min(100, Math.round(c.initialResonance * decayedRatio * 100)));

    // Active connectivity links surviving decay
    const activeConnectivity = Math.max(0, Math.round(c.associatedClustersCount * (currentRelevance / 100)));

    // Decay rate (% relevance loss per minute)
    const decayRatePctPerMin = Number(((currentRelevance * (Math.LN2 / halfLifeMins))).toFixed(2));

    // Estimated seconds until fossilization (<15% relevance)
    const remainingToFossilSecs = currentRelevance > 15
      ? Math.round(halfLifeMins * Math.log2(currentRelevance / 15) * 60)
      : 0;

    // Status classification
    let status: 'Anchor' | 'Fading' | 'Fragmented' | 'Fossilized' = 'Anchor';
    let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    let badgeLabel = 'ACTIVE ANCHOR';

    if (currentRelevance < 15) {
      status = 'Fossilized';
      statusColor = 'text-slate-500 bg-slate-500/10 border-slate-500/20';
      badgeLabel = 'FOSSILIZED RECORD';
    } else if (currentRelevance < 40) {
      status = 'Fragmented';
      statusColor = 'text-pink-400 bg-pink-500/10 border-pink-500/30';
      badgeLabel = 'FRAGMENTED GHOST';
    } else if (currentRelevance < 70) {
      status = 'Fading';
      statusColor = 'text-amber-300 bg-amber-500/10 border-amber-500/30';
      badgeLabel = 'FADING MEMORY';
    }

    return {
      ageMinutes: ageMinutes.toFixed(1),
      currentRelevance,
      activeConnectivity,
      decayRatePctPerMin,
      remainingToFossilSecs,
      halfLifeMins: halfLifeMins.toFixed(1),
      status,
      statusColor,
      badgeLabel
    };
  };

  // Snapshot Trajectory History for Charting every 3 seconds
  useEffect(() => {
    const now = Date.now();
    if (now - lastSnapshotRef.current >= 3000) {
      lastSnapshotRef.current = now;

      const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const pointData: DecayPoint = {
        timeStr,
        timestamp: now,
        avgRelevance: 0,
        activeAnchorsCount: 0,
        fossilizedCount: 0,
      };

      let sumRelevance = 0;
      concepts.forEach(c => {
        const state = computeConceptState(c);
        pointData[c.label] = state.currentRelevance;
        sumRelevance += state.currentRelevance;
        if (state.status === 'Anchor') pointData.activeAnchorsCount += 1;
        if (state.status === 'Fossilized') pointData.fossilizedCount += 1;
      });

      pointData.avgRelevance = Number((sumRelevance / (concepts.length || 1)).toFixed(1));

      setTrajectoryHistory(prev => {
        const updated = [...prev, pointData];
        const trimmed = updated.length > 30 ? updated.slice(updated.length - 30) : updated;
        try {
          localStorage.setItem(TRAJECTORY_HISTORY_KEY, JSON.stringify(trimmed));
        } catch {
          // ignore
        }
        return trimmed;
      });
    }
  }, [concepts, stats]);

  // Reinforce / Re-energize a concept
  const handleReinforceConcept = (id: string) => {
    setConcepts(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          initialResonance: 0.98,
          lastReinforcedAt: Date.now()
        };
      }
      return c;
    }));

    // Trigger assimilation event for visual feedback
    const target = concepts.find(c => c.id === id);
    if (target) {
      window.dispatchEvent(new CustomEvent('assimilate-concept', {
        detail: { concept: target.label }
      }));
    }
  };

  // Inject a new user concept keyword directly
  const handleInjectNewConcept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConceptInput.trim()) return;

    const label = newConceptInput.trim().toUpperCase();
    const newRec: SemanticConceptRecord = {
      id: `sc_${Date.now()}`,
      label,
      timestamp: Date.now(),
      initialResonance: 0.95,
      phaseAtInjection: stats.phase,
      coherenceAtInjection: stats.dna.coherence_bias,
      noiseAtInjection: stats.dna.noise_level,
      associatedClustersCount: Math.max(1, Math.floor(stats.clusters.length * 0.8)),
      reflection: `User injected concept during ${stats.phase} phase.`
    };

    setConcepts(prev => [newRec, ...prev.filter(c => c.label !== label)]);
    setNewConceptInput('');

    window.dispatchEvent(new CustomEvent('assimilate-concept', {
      detail: { concept: label }
    }));
  };

  const handleResetFossilRecord = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TRAJECTORY_HISTORY_KEY);
    setConcepts(INITIAL_CONCEPTS);
    setTrajectoryHistory([]);
  };

  // Filtered concepts
  const filteredConcepts = concepts.filter(c => {
    const state = computeConceptState(c);
    const matchesSearch = c.label.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterTab === 'anchors') return state.status === 'Anchor';
    if (filterTab === 'fading') return state.status === 'Fading' || state.status === 'Fragmented';
    if (filterTab === 'fossilized') return state.status === 'Fossilized';
    return true;
  });

  // Calculate overall metrics
  const conceptStates = concepts.map(c => computeConceptState(c));
  const avgRelevancePct = Math.round(conceptStates.reduce((acc, s) => acc + s.currentRelevance, 0) / (concepts.length || 1));
  const activeAnchorsCount = conceptStates.filter(s => s.status === 'Anchor').length;
  const fossilizedCount = conceptStates.filter(s => s.status === 'Fossilized').length;

  // Chart line colors for top concepts
  const LINE_COLORS = ['#22d3ee', '#10b981', '#f59e0b', '#ec4899', '#a855f7', '#6366f1', '#14b8a6'];

  return (
    <div className={`bg-black/40 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl p-3 backdrop-blur-md transition-all ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg shadow-[0_0_10px_rgba(99,102,241,0.2)]">
            <Archive className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-indigo-300 font-bold flex items-center gap-1.5">
              Semantic Decay & Fossil Record
              <span className="text-[8px] font-normal text-slate-500">[{concepts.length} concepts]</span>
            </h3>
            <p className="text-[8px] font-mono text-slate-400 flex items-center gap-1">
              Memory Loss & Connectivity Drift &bull; Avg Retention: <span className="text-cyan-300 font-bold">{avgRelevancePct}%</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetFossilRecord}
            className="p-1 bg-white/5 hover:bg-white/10 rounded text-slate-500 hover:text-indigo-300 transition-colors"
            title="Reset Fossil Record to Baseline"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1 bg-white/5 hover:bg-white/10 rounded text-slate-400 hover:text-indigo-300 transition-colors"
            title="Expand Semantic Decay Matrix & Retention Analysis"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Mini Metrics Bar */}
      <div className="grid grid-cols-3 gap-1.5 mb-2 text-[8px] font-mono text-center">
        <div className="bg-white/5 rounded border border-white/5 p-1">
          <span className="text-slate-500 block uppercase">Active Anchors</span>
          <span className="text-emerald-400 font-bold text-[10px]">{activeAnchorsCount}</span>
        </div>
        <div className="bg-white/5 rounded border border-white/5 p-1">
          <span className="text-slate-500 block uppercase">Retention Score</span>
          <span className="text-cyan-300 font-bold text-[10px]">{avgRelevancePct}%</span>
        </div>
        <div className="bg-white/5 rounded border border-white/5 p-1">
          <span className="text-slate-500 block uppercase">Fossilized</span>
          <span className="text-slate-400 font-bold text-[10px]">{fossilizedCount}</span>
        </div>
      </div>

      {/* Concept Decay Trajectory Line Chart */}
      {trajectoryHistory.length > 1 && (
        <div className="w-full h-28 relative mb-2 bg-black/20 rounded-lg p-1 border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trajectoryHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis
                dataKey="timeStr"
                tick={{ fill: '#64748b', fontSize: 7, fontFamily: 'monospace' }}
                stroke="rgba(255, 255, 255, 0.1)"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 7, fontFamily: 'monospace' }}
                stroke="rgba(255, 255, 255, 0.1)"
              />
              <Tooltip content={<CustomDecayTooltip />} />
              {concepts.slice(0, 5).map((c, i) => (
                <Line
                  key={c.id}
                  type="monotone"
                  dataKey={c.label}
                  name={c.label}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Fast Concept Inject Bar */}
      <form onSubmit={handleInjectNewConcept} className="flex gap-1.5 mb-2">
        <input
          type="text"
          value={newConceptInput}
          onChange={e => setNewConceptInput(e.target.value)}
          placeholder="Inject concept (e.g. HARMONY)..."
          className="flex-1 bg-black/50 border border-white/10 rounded px-2 py-1 text-[9px] font-mono text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="px-2 py-1 bg-indigo-500/20 border border-indigo-500/40 hover:bg-indigo-500/30 rounded text-[8px] font-mono text-indigo-300 uppercase font-bold flex items-center gap-1 transition-colors shrink-0"
        >
          <Plus className="w-3 h-3" /> Inject
        </button>
      </form>

      {/* Top 3 Active/Decaying Concepts Quick List */}
      <div className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/20 pr-1">
        {concepts.slice(0, 4).map(c => {
          const state = computeConceptState(c);
          return (
            <div
              key={c.id}
              className="bg-black/30 border border-white/5 hover:border-indigo-500/30 rounded-lg p-2 text-[8px] font-mono space-y-1.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-200 tracking-wider text-[9px]">{c.label}</span>
                  <span className={`px-1 rounded border text-[7px] font-bold ${state.statusColor}`}>
                    {state.badgeLabel}
                  </span>
                </div>

                <button
                  onClick={() => handleReinforceConcept(c.id)}
                  className="px-1.5 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-300 text-[7px] uppercase font-bold flex items-center gap-1 transition-colors"
                  title="Reinforce Memory Resonance (+98%)"
                >
                  <Zap className="w-2.5 h-2.5" /> Reinforce
                </button>
              </div>

              {/* Decay Progress Bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[7px] text-slate-400">
                  <span>Relevance: <strong className="text-cyan-300">{state.currentRelevance}%</strong></span>
                  <span>Connectivity: <strong className="text-indigo-300">{state.activeConnectivity} / {c.associatedClustersCount} links</strong></span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      state.currentRelevance >= 70
                        ? 'bg-emerald-400'
                        : state.currentRelevance >= 40
                        ? 'bg-amber-400'
                        : state.currentRelevance >= 15
                        ? 'bg-pink-400'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${state.currentRelevance}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-[7px] text-slate-500 italic pt-0.5 border-t border-white/5">
                <span>Decay Speed: -{state.decayRatePctPerMin}% / min</span>
                <span>Age: {state.ageMinutes}m</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Modal Analysis */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#090812] border border-indigo-500/30 rounded-2xl p-6 w-full max-w-4xl flex flex-col gap-4 shadow-[0_0_50px_rgba(99,102,241,0.2)] max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/30"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <Archive className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <div>
                    <h2 className="text-sm font-mono uppercase tracking-[0.25em] text-indigo-200 font-bold">
                      Semantic Memory Decay & Fossil Record Matrix
                    </h2>
                    <p className="text-[10px] font-mono text-slate-400">
                      Tracking concept relevance loss, neural connectivity decay, and memory prioritization over time
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Large Trajectory Area Chart */}
              <div className="w-full h-64 bg-black/40 border border-white/5 rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trajectoryHistory} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                    <XAxis
                      dataKey="timeStr"
                      tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                      stroke="rgba(255, 255, 255, 0.15)"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                      stroke="rgba(255, 255, 255, 0.15)"
                    />
                    <Tooltip content={<CustomDecayTooltip />} />
                    {concepts.map((c, i) => (
                      <Line
                        key={c.id}
                        type="monotone"
                        dataKey={c.label}
                        name={c.label}
                        stroke={LINE_COLORS[i % LINE_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Controls and Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/40 p-3 rounded-xl border border-white/5 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  {(['all', 'anchors', 'fading', 'fossilized'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setFilterTab(tab)}
                      className={`px-2.5 py-1 rounded border uppercase font-bold transition-all ${
                        filterTab === tab
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                          : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search concepts..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-[10px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Concept Fossil Table Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/20 p-1">
                {filteredConcepts.map(c => {
                  const state = computeConceptState(c);
                  return (
                    <div
                      key={c.id}
                      className="bg-black/50 border border-white/10 hover:border-indigo-500/40 rounded-xl p-3 text-[10px] font-mono space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 text-xs tracking-wider">{c.label}</span>
                          <span className={`px-1.5 py-0.5 rounded border text-[8px] font-bold ${state.statusColor}`}>
                            {state.badgeLabel}
                          </span>
                        </div>

                        <button
                          onClick={() => handleReinforceConcept(c.id)}
                          className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-300 text-[8px] uppercase font-bold flex items-center gap-1 transition-colors"
                        >
                          <Zap className="w-3 h-3" /> Reinforce
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Relevance Retention:</span>
                          <strong className="text-cyan-300">{state.currentRelevance}%</strong>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              state.currentRelevance >= 70
                                ? 'bg-emerald-400'
                                : state.currentRelevance >= 40
                                ? 'bg-amber-400'
                                : state.currentRelevance >= 15
                                ? 'bg-pink-400'
                                : 'bg-slate-600'
                            }`}
                            style={{ width: `${state.currentRelevance}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[9px] text-slate-400">
                        <div>
                          <span className="text-slate-600 block">Connectivity Links:</span>
                          <strong className="text-indigo-300">{state.activeConnectivity} / {c.associatedClustersCount} active</strong>
                        </div>
                        <div>
                          <span className="text-slate-600 block">Decay Velocity:</span>
                          <strong className="text-pink-300">-{state.decayRatePctPerMin}% / min</strong>
                        </div>
                        <div>
                          <span className="text-slate-600 block">Age in Memory:</span>
                          <strong className="text-slate-300">{state.ageMinutes} mins</strong>
                        </div>
                        <div>
                          <span className="text-slate-600 block">Phase at Ingestion:</span>
                          <strong className="text-emerald-300">{c.phaseAtInjection}</strong>
                        </div>
                      </div>

                      {c.reflection && (
                        <div className="p-1.5 bg-white/5 rounded border border-white/5 text-[9px] text-slate-400 italic">
                          "{c.reflection}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* Custom Chart Tooltip */
const CustomDecayTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#090812]/95 border border-indigo-500/50 p-3 rounded-lg shadow-2xl text-[9px] font-mono space-y-1.5 min-w-[200px]">
        <div className="border-b border-white/10 pb-1 font-bold text-slate-300 flex justify-between">
          <span>Snapshot Time:</span>
          <span className="text-indigo-400">{label}</span>
        </div>
        <div className="space-y-1">
          {payload.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center text-[9px]">
              <span className="flex items-center gap-1.5" style={{ color: item.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <strong>{item.name}:</strong>
              </span>
              <span className="font-bold text-slate-200">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};
