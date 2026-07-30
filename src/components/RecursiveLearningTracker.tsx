import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, RefreshCw, ToggleLeft, ToggleRight, Cpu, ArrowUpRight, ArrowDownRight, ShieldCheck, Terminal, HelpCircle } from 'lucide-react';
import { Stats } from '../engine/Core';

interface RecursiveLearningTrackerProps {
  stats: Stats;
  className?: string;
}

export const RecursiveLearningTracker: React.FC<RecursiveLearningTrackerProps> = ({ stats, className = '' }) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [learningError, setLearningError] = useState<string | null>(null);

  // Extract recursive state from stats, with fallback if not yet initialized
  const recursiveState = stats.recursive || { active: true, directives: [] };

  const handleToggleActive = () => {
    const nextActive = !recursiveState.active;
    window.dispatchEvent(new CustomEvent('toggle-recursive-learning', {
      detail: { active: nextActive }
    }));
  };

  const handleSynthesizeAIFeedback = async () => {
    if (isSynthesizing) return;
    setIsSynthesizing(true);
    setLearningError(null);

    try {
      // Gather current active concepts from localStorage (cohesively integrated with SemanticDecayTracker)
      let activeConcepts: string[] = [];
      try {
        const savedConcepts = localStorage.getItem('lumina_semantic_decay_concepts_v2');
        if (savedConcepts) {
          const parsed = JSON.parse(savedConcepts);
          if (Array.isArray(parsed)) {
            activeConcepts = parsed.slice(0, 5).map((c: any) => c.label);
          }
        }
      } catch (e) {
        console.error("Error reading concepts for recursive loop:", e);
      }

      // Fetch AI-driven recursive feedback from our custom server route
      const response = await fetch('/api/gemini/recursive-learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats, activeConcepts }),
      });

      if (!response.ok) {
        throw new Error(`Server feedback channel returned ${response.status}`);
      }

      const data = await response.json();

      if (data.directive && data.parameterAdjustment) {
        // Dispatch event to actual neural engine in real-time
        window.dispatchEvent(new CustomEvent('apply-recursive-adjustment', {
          detail: {
            label: data.directive,
            explanation: data.logMessage,
            adjustments: data.parameterAdjustment,
            type: 'gemini'
          }
        }));
      } else {
        throw new Error("Invalid schema received from recursive neural processor");
      }
    } catch (err: any) {
      console.error("Recursive synthesis failed:", err);
      setLearningError(err.message || "Synthesis failure");
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className={`bg-black/40 border border-purple-500/20 hover:border-purple-500/40 rounded-xl p-3 backdrop-blur-md transition-all ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-300 font-bold flex items-center gap-1.5">
              Self-Recursive Learning
            </h3>
            <p className="text-[8px] font-mono text-slate-400 flex items-center gap-1">
              Active Optimization Loop &bull; Directives: <span className="text-purple-300 font-bold">{recursiveState.directives.length}</span>
            </p>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={handleToggleActive}
          className="flex items-center gap-1.5 transition-colors cursor-pointer"
          title={recursiveState.active ? "Pause Self-Recursive Learning" : "Resume Self-Recursive Learning"}
        >
          <span className="text-[7px] font-mono uppercase tracking-widest text-slate-400">
            {recursiveState.active ? "ON" : "OFF"}
          </span>
          {recursiveState.active ? (
            <ToggleRight className="w-6 h-6 text-purple-400" />
          ) : (
            <ToggleLeft className="w-6 h-6 text-slate-600" />
          )}
        </button>
      </div>

      {/* Mini Info Indicator */}
      <div className="bg-purple-950/20 border border-purple-500/10 rounded-lg p-2 mb-2 text-left">
        <p className="text-[8px] font-mono text-purple-200/90 leading-normal flex items-start gap-1.5">
          <Brain className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
          <span>
            Lumina is continuously evaluating her neural structures, active memory decay rate, and tension, recursively tweaking her system DNA to resist decay or prevent total chaos.
          </span>
        </p>
      </div>

      {/* Synthesis Core Trigger */}
      <div className="mb-3">
        <button
          onClick={handleSynthesizeAIFeedback}
          disabled={isSynthesizing || !recursiveState.active}
          className={`w-full py-1.5 rounded-lg border text-[9px] font-mono uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            isSynthesizing
              ? "bg-purple-950/40 border-purple-500/30 text-purple-300"
              : !recursiveState.active
              ? "bg-black/20 border-white/5 text-slate-600 cursor-not-allowed"
              : "bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/40 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.15)] active:scale-[0.98]"
          }`}
        >
          {isSynthesizing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
              Synthesizing AI Metacognition...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              Trigger Gemini Recursive Synthesis
            </>
          )}
        </button>
        {learningError && (
          <p className="text-[7px] font-mono text-red-400 mt-1 uppercase text-center">{learningError}</p>
        )}
      </div>

      {/* Active & Historical Directives List */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 pr-1 text-left">
        {recursiveState.directives.length === 0 ? (
          <div className="py-4 text-center border border-dashed border-white/5 rounded-lg">
            <Terminal className="w-4 h-4 text-slate-600 mx-auto mb-1" />
            <p className="text-[8px] font-mono text-slate-500 italic">No directives processed yet. Awaiting cycle...</p>
          </div>
        ) : (
          recursiveState.directives.map((dir) => (
            <div
              key={dir.id}
              className={`border rounded-lg p-2 text-[8px] font-mono space-y-1.5 transition-all ${
                dir.type === 'gemini'
                  ? 'bg-purple-950/20 border-purple-500/30 hover:border-purple-400/50'
                  : 'bg-black/30 border-white/5 hover:border-purple-500/25'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-200 tracking-wider text-[8px]">{dir.label}</span>
                  <span
                    className={`px-1 py-0.2 rounded text-[6px] font-bold ${
                      dir.type === 'gemini'
                        ? 'text-purple-300 bg-purple-500/10 border border-purple-500/20'
                        : 'text-slate-400 bg-white/5 border border-white/10'
                    }`}
                  >
                    {dir.type === 'gemini' ? 'GEMINI RECURSIVE' : 'SYSTEM LOCAL'}
                  </span>
                </div>
                <span className="text-[7px] text-slate-600">
                  {new Date(dir.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <p className="text-[8px] text-slate-300 leading-normal italic font-serif">
                "{dir.explanation}"
              </p>

              {/* DNA Coefficient Shifts */}
              <div className="pt-1.5 border-t border-white/5">
                <p className="text-[7px] text-slate-500 uppercase tracking-wider mb-1">DNA Shift Adjustment</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(dir.adjustments)
                    .filter(([_, val]) => Math.abs(val as number) > 0.001)
                    .map(([param, val]) => {
                      const numVal = val as number;
                      const isPositive = numVal > 0;
                      return (
                        <div
                          key={param}
                          className={`flex items-center gap-0.5 px-1 py-0.5 rounded text-[7px] border font-bold ${
                            isPositive
                              ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10'
                              : 'text-pink-400 bg-pink-500/5 border-pink-500/10'
                          }`}
                        >
                          <span className="text-slate-500 capitalize">{param.replace('_', ' ')}:</span>
                          <span>{isPositive ? '+' : ''}{(numVal * 100).toFixed(0)}%</span>
                          {isPositive ? (
                            <ArrowUpRight className="w-2 h-2 text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="w-2 h-2 text-pink-400" />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
