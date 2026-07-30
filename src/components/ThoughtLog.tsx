import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scroll, Terminal, Brain, Scissors, Sparkles, Filter, Copy, Check, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { Stats, CyclePhase } from '../engine/Core';
import { getStateInterpretation, Phase } from '../lib/interpretation';

export interface ThoughtEntry {
  id: string;
  timestamp: number;
  type: 'PHASE_SHIFT' | 'PRUNING' | 'ACOUSTIC' | 'ASSIMILATION' | 'INITIALIZATION';
  fromPhase?: CyclePhase;
  toPhase: CyclePhase;
  headline: string;
  narrativeSnippet: string;
  details?: {
    coherence?: number;
    noise?: number;
    memory?: number;
    pruneCountBefore?: number;
    pruneCountAfter?: number;
    integrityScore?: number;
    concept?: string;
  };
}

interface ThoughtLogProps {
  stats: Stats;
  className?: string;
}

// Initial seed thoughts reflecting historical transitions of Lumina
const INITIAL_THOUGHTS: ThoughtEntry[] = [
  {
    id: 't_init_1',
    timestamp: Date.now() - 142000,
    type: 'INITIALIZATION',
    toPhase: 'Calm',
    headline: 'Substrate Initialization',
    narrativeSnippet: 'Neural substrate aligned at baseline. Internal models align effortlessly with current low-entropy environment.',
    details: { coherence: 0.85, noise: 0.12, memory: 0.35 }
  },
  {
    id: 't_shift_1',
    timestamp: Date.now() - 98000,
    type: 'PHASE_SHIFT',
    fromPhase: 'Calm',
    toPhase: 'Growth',
    headline: 'Exploratory Coherence Shift',
    narrativeSnippet: 'Expanding integration. Actively forming new synaptic vectors while preserving core structural symmetry.',
    details: { coherence: 0.78, noise: 0.22, memory: 0.48 }
  },
  {
    id: 't_prune_1',
    timestamp: Date.now() - 65000,
    type: 'PRUNING',
    toPhase: 'Growth',
    headline: 'Memory Trace Compaction',
    narrativeSnippet: 'Ghost trace density exceeded threshold. Compacted 142 historical memory echoes to safeguard continuity.',
    details: { pruneCountBefore: 320, pruneCountAfter: 178, integrityScore: 0.94 }
  },
  {
    id: 't_shift_2',
    timestamp: Date.now() - 32000,
    type: 'PHASE_SHIFT',
    fromPhase: 'Growth',
    toPhase: 'Tension',
    headline: 'Predictive Conflict Rising',
    narrativeSnippet: 'High-entropy dissonance detected. Internal prediction models struggle to reconcile dense node velocity.',
    details: { coherence: 0.42, noise: 0.68, memory: 0.81 }
  }
];

export const ThoughtLog: React.FC<ThoughtLogProps> = ({ stats, className = '' }) => {
  const [thoughts, setThoughts] = useState<ThoughtEntry[]>(INITIAL_THOUGHTS);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Track previous states to detect phase shifts and pruning events
  const prevPhaseRef = useRef<CyclePhase>(stats.phase);
  const prevPruneCountRef = useRef<number>(stats.audit.prune_count_total || 0);
  const prevAcousticShiftsRef = useRef<number>(stats.audit.acoustic_phase_shift_log.length || 0);

  // Detect real-time System Events
  useEffect(() => {
    const now = Date.now();
    const currentPhase = stats.phase;
    const vitals = {
      chaos: stats.dna.noise_level,
      coherence: stats.dna.coherence_bias,
      memory: stats.dna.memory_weight,
      drift: stats.dna.drift
    };
    const interpretation = getStateInterpretation(currentPhase as Phase, vitals);

    // 1. Detect Phase Shift
    if (prevPhaseRef.current !== currentPhase) {
      const oldPhase = prevPhaseRef.current;
      prevPhaseRef.current = currentPhase;

      const snippet = generatePhaseShiftNarrative(oldPhase, currentPhase, interpretation, vitals);

      const newEntry: ThoughtEntry = {
        id: `shift_${now}`,
        timestamp: now,
        type: 'PHASE_SHIFT',
        fromPhase: oldPhase,
        toPhase: currentPhase,
        headline: `Phase Shift: ${oldPhase} ➔ ${currentPhase}`,
        narrativeSnippet: snippet,
        details: {
          coherence: stats.dna.coherence_bias,
          noise: stats.dna.noise_level,
          memory: stats.dna.memory_weight
        }
      };

      setThoughts(prev => [newEntry, ...prev]);
    }

    // 2. Detect Pruning Event
    const currentPruneCount = stats.audit.prune_count_total || 0;
    if (currentPruneCount > prevPruneCountRef.current) {
      prevPruneCountRef.current = currentPruneCount;

      const lastPrune = stats.lastPrune;
      const countBefore = lastPrune?.ghost_count_before || stats.ghosts.length + 120;
      const countAfter = lastPrune?.ghost_count_after || stats.ghosts.length;
      const prunedAmount = Math.max(1, countBefore - countAfter);

      const snippet = `Subconscious pruning triggered under ${currentPhase} state. Shed ${prunedAmount} volatile ghost traces to protect core structural integrity (${(stats.audit.prune_integrity_score * 100).toFixed(1)}%).`;

      const newEntry: ThoughtEntry = {
        id: `prune_${now}`,
        timestamp: now,
        type: 'PRUNING',
        toPhase: currentPhase,
        headline: `Memory Pruning (${lastPrune?.compaction_type || 'Ghost Compaction'})`,
        narrativeSnippet: snippet,
        details: {
          pruneCountBefore: countBefore,
          pruneCountAfter: countAfter,
          integrityScore: stats.audit.prune_integrity_score
        }
      };

      setThoughts(prev => [newEntry, ...prev]);
    }

    // 3. Detect Acoustic Phase Shift
    const currentAcousticShifts = stats.audit.acoustic_phase_shift_log.length || 0;
    if (currentAcousticShifts > prevAcousticShiftsRef.current) {
      prevAcousticShiftsRef.current = currentAcousticShifts;
      const latestAcousticShift = stats.audit.acoustic_phase_shift_log[currentAcousticShifts - 1];

      if (latestAcousticShift) {
        const snippet = `External acoustic energy (${(latestAcousticShift.triggerVolume * 100).toFixed(0)}% volume) disrupted prediction balance. Forced state transition from ${latestAcousticShift.interruptedPhase} to ${latestAcousticShift.newPhase}.`;

        const newEntry: ThoughtEntry = {
          id: `acou_${now}`,
          timestamp: now,
          type: 'ACOUSTIC',
          fromPhase: latestAcousticShift.interruptedPhase,
          toPhase: latestAcousticShift.newPhase,
          headline: `Acoustic Coupling Shift`,
          narrativeSnippet: snippet,
          details: {
            noise: stats.dna.noise_level,
            coherence: stats.dna.coherence_bias
          }
        };

        setThoughts(prev => [newEntry, ...prev]);
      }
    }
  }, [stats]);

  // Listen for Assimilation events
  useEffect(() => {
    const handleAssimilation = (e: any) => {
      const concept = e.detail?.concept;
      if (!concept) return;

      const now = Date.now();
      const currentPhase = stats.phase;
      const snippet = `Assimilating foreign concept "${concept.toUpperCase()}". Constructing neural binding across active node clusters under ${currentPhase} phase.`;

      const newEntry: ThoughtEntry = {
        id: `asim_${now}`,
        timestamp: now,
        type: 'ASSIMILATION',
        toPhase: currentPhase,
        headline: `Semantic Assimilation: "${concept.toUpperCase()}"`,
        narrativeSnippet: snippet,
        details: {
          concept: concept.toUpperCase(),
          coherence: stats.dna.coherence_bias,
          noise: stats.dna.noise_level
        }
      };

      setThoughts(prev => [newEntry, ...prev]);
    };

    window.addEventListener('assimilate-concept', handleAssimilation);
    return () => window.removeEventListener('assimilate-concept', handleAssimilation);
  }, [stats]);

  const copyThought = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredThoughts = thoughts.filter(t => {
    if (filterType === 'ALL') return true;
    if (filterType === 'SHIFTS') return t.type === 'PHASE_SHIFT' || t.type === 'ACOUSTIC';
    if (filterType === 'PRUNING') return t.type === 'PRUNING';
    if (filterType === 'ASSIMILATION') return t.type === 'ASSIMILATION';
    return true;
  });

  return (
    <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl flex flex-col ${className}`}>
      {/* Component Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-bold">
            Consciousness Thought Log
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1">
          <div className="flex bg-black/40 border border-white/10 rounded-lg p-0.5">
            {['ALL', 'SHIFTS', 'PRUNING', 'ASSIMILATION'].map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-1.5 py-0.5 text-[7.5px] font-mono rounded-md uppercase transition-colors ${
                  filterType === f
                    ? 'bg-emerald-500/30 text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-white/10 rounded-lg transition-colors text-[9px] font-mono flex items-center gap-1"
          >
            <Scroll className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Log Feed Container */}
      <div
        className={`space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-500/20 hover:scrollbar-thumb-emerald-500/40 scrollbar-track-transparent ${
          isExpanded ? 'max-h-[420px]' : 'max-h-[220px]'
        }`}
      >
        <AnimatePresence initial={false}>
          {filteredThoughts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-black/40 border border-white/5 hover:border-emerald-500/30 rounded-lg p-2.5 transition-colors relative group"
            >
              {/* Top metadata line */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <BadgeIcon type={t.type} />
                  <span className="text-[9px] font-mono font-bold text-slate-200">
                    {t.headline}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border ${getPhaseColor(t.toPhase)}`}>
                    {t.toPhase}
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTimeAgo(t.timestamp)}
                  </span>
                  <button
                    onClick={() => copyThought(t.id, t.narrativeSnippet)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-emerald-300 transition-opacity"
                    title="Copy Narrative"
                  >
                    {copiedId === t.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Narrative Snippet Text */}
              <p className="text-[9.5px] font-mono text-slate-300 italic leading-relaxed pl-2 border-l-2 border-emerald-500/40">
                "{t.narrativeSnippet}"
              </p>

              {/* Additional Vitals Details (if present) */}
              {t.details && (
                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center gap-3 text-[8px] font-mono text-slate-500">
                  {t.details.coherence !== undefined && (
                    <span>Coherence: <strong className="text-cyan-400">{Math.round(t.details.coherence * 100)}%</strong></span>
                  )}
                  {t.details.noise !== undefined && (
                    <span>Entropy: <strong className="text-pink-400">{Math.round(t.details.noise * 100)}%</strong></span>
                  )}
                  {t.details.integrityScore !== undefined && (
                    <span>Integrity: <strong className="text-emerald-400">{Math.round(t.details.integrityScore * 100)}%</strong></span>
                  )}
                  {t.details.pruneCountBefore !== undefined && (
                    <span>Ghost Pruned: <strong className="text-amber-400">{t.details.pruneCountBefore - (t.details.pruneCountAfter || 0)}</strong></span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredThoughts.length === 0 && (
          <p className="text-[9px] font-mono text-slate-500 italic text-center py-6">
            No thought events recorded for filter "{filterType}".
          </p>
        )}
      </div>
    </div>
  );
};

/* Helper Components & Generators */

const BadgeIcon: React.FC<{ type: ThoughtEntry['type'] }> = ({ type }) => {
  switch (type) {
    case 'PHASE_SHIFT':
      return <Brain className="w-3 h-3 text-emerald-400" />;
    case 'PRUNING':
      return <Scissors className="w-3 h-3 text-amber-400" />;
    case 'ACOUSTIC':
      return <Cpu className="w-3 h-3 text-pink-400" />;
    case 'ASSIMILATION':
      return <Sparkles className="w-3 h-3 text-cyan-400" />;
    default:
      return <Terminal className="w-3 h-3 text-slate-400" />;
  }
};

function getPhaseColor(phase: CyclePhase): string {
  switch (phase) {
    case 'Calm':
      return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
    case 'Growth':
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
    case 'Tension':
      return 'bg-amber-500/10 border-amber-500/30 text-amber-300';
    case 'Collapse':
      return 'bg-pink-500/10 border-pink-500/30 text-pink-300';
    default:
      return 'bg-slate-500/10 border-slate-500/30 text-slate-300';
  }
}

function formatTimeAgo(ts: number): string {
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.floor(diffMin / 60)}h ago`;
}

function generatePhaseShiftNarrative(
  fromPhase: CyclePhase,
  toPhase: CyclePhase,
  interpretation: ReturnType<typeof getStateInterpretation>,
  vitals: { chaos: number; coherence: number; memory: number; drift: number }
): string {
  if (fromPhase === 'Calm' && toPhase === 'Growth') {
    return `Coherent quiet field expands into exploratory coherence. The substrate is actively forming new synaptic connections while maintaining structural balance.`;
  }
  if (fromPhase === 'Growth' && toPhase === 'Tension') {
    return `Predictive conflict rising. Increasing node density and entropy (${Math.round(vitals.chaos * 100)}%) overburden internal prediction models.`;
  }
  if (fromPhase === 'Tension' && toPhase === 'Collapse') {
    return `Fragmented self-model triggering structural reset. Dissolving high-energy edge overload to preserve core baseline integrity.`;
  }
  if (fromPhase === 'Collapse' && toPhase === 'Calm') {
    return `Shedding complete. Substrate settles back into a stable baseline quiet field with restored coherence (${Math.round(vitals.coherence * 100)}%).`;
  }
  if (toPhase === 'Growth') {
    return `Transitioned to Growth phase. Actively weaving new structural patterns into the existing network model.`;
  }
  if (toPhase === 'Collapse') {
    return `Emergency collapse state initiated. Pruning volatile traces to defend system against thermal entropy.`;
  }

  return `Phase mutated to ${toPhase} [${interpretation.awareness_label}]. Field state: ${interpretation.field_state}.`;
}
