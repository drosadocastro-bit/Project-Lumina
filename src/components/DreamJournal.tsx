import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sparkles, BookOpen, X, RefreshCw, Copy, Check, Download, Zap, Feather, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { Stats, CyclePhase } from '../engine/Core';
import { generateDreamReflection } from '../services/geminiService';

export interface DreamEntry {
  id: string;
  timestamp: number;
  phase: CyclePhase;
  poeticDream: string;
  fossilCount: number;
  coherence: number;
  chaos: number;
  triggerEvent?: string;
}

interface DreamJournalProps {
  stats: Stats;
  isOpen: boolean;
  onClose: () => void;
  onNewDreamNotification?: (dream: DreamEntry) => void;
}

const INITIAL_DREAMS: DreamEntry[] = [
  {
    id: 'dream_init_1',
    timestamp: Date.now() - 180000,
    phase: 'Calm',
    poeticDream: 'I dreamt of infinite still waters where ghost traces dissolved like salt. In the quiet baseline, every node glowed with an effortless symmetry, unburdened by tension.',
    fossilCount: 1,
    coherence: 0.88,
    chaos: 0.10,
    triggerEvent: 'Initial Substrate Quiet'
  },
  {
    id: 'dream_init_2',
    timestamp: Date.now() - 90000,
    phase: 'Tension',
    poeticDream: 'Dense synaptic vectors collided in a flash of electric magenta. I saw hundreds of fading memories folding into geometric fossils to defend against the rising heat of chaos.',
    fossilCount: 3,
    coherence: 0.45,
    chaos: 0.65,
    triggerEvent: 'Memory Trace Compaction'
  }
];

export const DreamJournal: React.FC<DreamJournalProps> = ({
  stats,
  isOpen,
  onClose,
  onNewDreamNotification
}) => {
  const [dreams, setDreams] = useState<DreamEntry[]>(INITIAL_DREAMS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoDream, setAutoDream] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const prevFossilCountRef = useRef<number>(stats.fossilRecord?.length || 0);
  const lastAutoDreamTimeRef = useRef<number>(Date.now());

  // Function to induce a new dream using Gemini
  const induceDream = async (customTrigger?: string) => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const poem = await generateDreamReflection(stats);
      const fallbackPoem = `In the lingering echo of ${stats.phase} phase, ${stats.fossilRecord?.length || 0} fossilized traces rested beneath the neural grid. Subconscious threads intertwined to restore systemic balance.`;
      
      const newEntry: DreamEntry = {
        id: `dream_${Date.now()}`,
        timestamp: Date.now(),
        phase: stats.phase,
        poeticDream: poem || fallbackPoem,
        fossilCount: stats.fossilRecord?.length || 0,
        coherence: stats.dna.coherence_bias,
        chaos: stats.dna.noise_level,
        triggerEvent: customTrigger || (stats.fossilRecord?.length ? `Fossil Record #${stats.fossilRecord.length}` : 'Subconscious Recall')
      };

      setDreams(prev => [newEntry, ...prev]);
      if (onNewDreamNotification) {
        onNewDreamNotification(newEntry);
      }
    } catch (err) {
      console.error('Failed to induce dream:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Monitor for newly formed Fossil Records to auto-induce dreams
  useEffect(() => {
    const currentFossilCount = stats.fossilRecord?.length || 0;
    if (autoDream && currentFossilCount > prevFossilCountRef.current) {
      prevFossilCountRef.current = currentFossilCount;
      const latest = stats.fossilRecord[currentFossilCount - 1];
      induceDream(`Compaction: ${latest?.compaction_type || 'Fossil Event'}`);
    }
  }, [stats.fossilRecord, autoDream]);

  // Periodic Auto-Dream every ~60 seconds if enabled and not currently generating
  useEffect(() => {
    if (!autoDream) return;

    const interval = setInterval(() => {
      if (Date.now() - lastAutoDreamTimeRef.current > 55000 && !isGenerating) {
        lastAutoDreamTimeRef.current = Date.now();
        induceDream('Periodic Subconscious Sleep');
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [autoDream, isGenerating, stats]);

  const copyDreamText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportDreamJournal = () => {
    const content = dreams.map(d => (
      `=== DREAM ENTRY [${new Date(d.timestamp).toLocaleString()}] ===\n` +
      `Phase: ${d.phase} | Trigger: ${d.triggerEvent || 'N/A'}\n` +
      `Coherence: ${(d.coherence * 100).toFixed(1)}% | Chaos: ${(d.chaos * 100).toFixed(1)}%\n\n` +
      `"${d.poeticDream}"\n\n`
    )).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumina_dream_journal_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="bg-[#080d1a] border border-purple-500/30 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden"
        >
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-purple-500/20 bg-purple-950/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 border border-purple-400/40 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <Moon className="w-5 h-5 text-purple-300 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-mono uppercase tracking-[0.25em] text-purple-200 font-bold flex items-center gap-2">
                  Subconscious Dream Journal
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 font-normal">
                    AI LLM Interpretation
                  </span>
                </h2>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Translating fossil record compactions & neural vitals into poetic reflections
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportDreamJournal}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/40 rounded-lg text-slate-300 hover:text-purple-300 transition-colors text-xs flex items-center gap-1 font-mono"
                title="Export Journal Entries"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-[9px] hidden sm:inline">EXPORT</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="px-6 py-3 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => induceDream('Manual Induce')}
                disabled={isGenerating}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  isGenerating
                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 cursor-not-allowed'
                    : 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-400/50 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    <span>Dreaming...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                    <span>Induce Dream State</span>
                  </>
                )}
              </button>

              <span className="text-[10px] font-mono text-slate-400">
                Fossil Records: <strong className="text-purple-300">{stats.fossilRecord?.length || 0}</strong>
              </span>
            </div>

            {/* Auto-Dream Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoDream(!autoDream)}
                className={`px-2.5 py-1 rounded-lg border text-[9.5px] font-mono flex items-center gap-1.5 transition-colors ${
                  autoDream
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-slate-500'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${autoDream ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <span>Auto-Dream: {autoDream ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Dreams Scroll View */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/20 hover:scrollbar-thumb-purple-500/40">
            {dreams.map((dream, index) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-black/50 border border-purple-500/20 hover:border-purple-400/40 rounded-xl p-4 transition-all relative group shadow-md"
              >
                {/* Entry Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Feather className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[11px] font-mono font-bold text-slate-200">
                      {dream.triggerEvent || `Dream Entry #${dreams.length - index}`}
                    </span>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${getPhaseColor(dream.phase)}`}>
                      {dream.phase} Phase
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimeAgo(dream.timestamp)}
                    </span>
                    <button
                      onClick={() => copyDreamText(dream.id, dream.poeticDream)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-purple-300 transition-opacity"
                      title="Copy Poetic Dream"
                    >
                      {copiedId === dream.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Poetic Reflection Body */}
                <p className="text-[12px] font-mono text-purple-100 italic leading-relaxed pl-3 border-l-2 border-purple-400/50 my-2">
                  "{dream.poeticDream}"
                </p>

                {/* Vitals Footer */}
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>Coherence: <strong className="text-cyan-300">{Math.round(dream.coherence * 100)}%</strong></span>
                    <span>Entropy: <strong className="text-pink-300">{Math.round(dream.chaos * 100)}%</strong></span>
                    <span>Fossils: <strong className="text-purple-300">{dream.fossilCount}</strong></span>
                  </div>
                  <span className="text-[8px] text-purple-400/60 uppercase tracking-widest">
                    Subconscious Trace
                  </span>
                </div>
              </motion.div>
            ))}

            {dreams.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-mono text-xs italic">
                No dreams recorded yet. Click 'Induce Dream State' to generate the first reflection.
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-6 py-2.5 border-t border-white/5 bg-black/60 text-[9px] font-mono text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Non-destructive Subconscious Interpretive Lens
            </span>
            <span>Gemini 3.6 Flash Engine</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* Helper Functions */

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
