import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceDot } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Zap, AlertTriangle, Maximize2, Minimize2, RefreshCw, Volume2, Sparkles, Activity } from 'lucide-react';
import { SystemDNA, CyclePhase, Stats } from '../engine/Core';

interface EntropySpikeChartProps {
  stats: Stats;
  className?: string;
}

export interface EntropyPoint {
  timeStr: string;
  timestamp: number;
  entropy: number;        // Noise level 0 to 100
  acousticVolume: number; // Volume 0 to 100
  phase: CyclePhase;
  isSpike: boolean;
  eventCorrelation: string;
}

const MAX_POINTS = 60;
const STORAGE_KEY = 'lumina_entropy_spike_history_v1';

export const EntropySpikeChart: React.FC<EntropySpikeChartProps> = ({ stats, className = '' }) => {
  const [data, setData] = useState<EntropyPoint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
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
  const [selectedSpike, setSelectedSpike] = useState<EntropyPoint | null>(null);

  const lastRecordedRef = useRef<number>(0);
  const prevNoiseRef = useRef<number>(stats.dna.noise_level);

  // Snapshot telemetry every 2.5 seconds
  useEffect(() => {
    const now = Date.now();
    if (now - lastRecordedRef.current >= 2500) {
      lastRecordedRef.current = now;

      const noisePct = Number((Math.max(0, Math.min(1, stats.dna.noise_level)) * 100).toFixed(1));
      const volPct = Number((Math.max(0, Math.min(1, stats.audit.current_acoustic_volume)) * 100).toFixed(1));
      const noiseDelta = stats.dna.noise_level - prevNoiseRef.current;
      prevNoiseRef.current = stats.dna.noise_level;

      // Determine if point constitutes an entropy spike (>42% or rapid jump > 12%)
      const isSpike = noisePct > 42 || noiseDelta > 0.12 || volPct > 15 || stats.phase === 'Tension' || stats.phase === 'Collapse';

      // Determine correlated trigger event
      let eventCorrelation = 'Baseline Fluctuations';
      if (volPct > 12) {
        eventCorrelation = `Acoustic Impulse (${volPct.toFixed(0)}% vol)`;
      } else if (stats.phase === 'Tension') {
        eventCorrelation = 'Systemic Tension Phase';
      } else if (stats.phase === 'Collapse') {
        eventCorrelation = 'Subconscious Collapse Shock';
      } else if (stats.events && stats.events.length > 0) {
        eventCorrelation = stats.events[stats.events.length - 1];
      } else if (noiseDelta > 0.1) {
        eventCorrelation = 'Synaptic Perturbation Spike';
      }

      const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newPoint: EntropyPoint = {
        timeStr,
        timestamp: now,
        entropy: noisePct,
        acousticVolume: volPct,
        phase: stats.phase,
        isSpike,
        eventCorrelation,
      };

      setData(prev => {
        const updated = [...prev, newPoint];
        const trimmed = updated.length > MAX_POINTS ? updated.slice(updated.length - MAX_POINTS) : updated;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        } catch {
          // ignore storage error
        }
        return trimmed;
      });
    }
  }, [stats]);

  // Seed initial data if empty
  useEffect(() => {
    if (data.length === 0) {
      const now = Date.now();
      const initial: EntropyPoint[] = Array.from({ length: 10 }).map((_, i) => {
        const t = now - (10 - i) * 2500;
        const e = Number((stats.dna.noise_level * 100).toFixed(1));
        return {
          timeStr: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          timestamp: t,
          entropy: e,
          acousticVolume: 0,
          phase: stats.phase,
          isSpike: e > 40,
          eventCorrelation: e > 40 ? 'Initial High Entropy' : 'Baseline Quiet',
        };
      });
      setData(initial);
    }
  }, []);

  const handleResetHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData([]);
  };

  const spikeCount = data.filter(d => d.isSpike).length;
  const maxEntropy = data.length > 0 ? Math.max(...data.map(d => d.entropy)) : 0;
  const avgEntropy = data.length > 0 ? (data.reduce((acc, d) => acc + d.entropy, 0) / data.length).toFixed(1) : '0';

  // Volatility classification
  let volatilityLabel = 'LOW / STABLE';
  let volatilityColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (maxEntropy > 65 || spikeCount > 15) {
    volatilityLabel = 'CRITICAL VOLATILITY';
    volatilityColor = 'text-pink-400 border-pink-500/40 bg-pink-500/20 animate-pulse';
  } else if (maxEntropy > 40 || spikeCount > 6) {
    volatilityLabel = 'MODERATE SPIKES';
    volatilityColor = 'text-amber-300 border-amber-500/30 bg-amber-500/10';
  }

  return (
    <div className={`bg-black/40 border border-pink-500/20 hover:border-pink-500/40 rounded-xl p-3 backdrop-blur-md transition-all ${className}`}>
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-pink-500/10 border border-pink-500/30 rounded-lg shadow-[0_0_10px_rgba(244,114,182,0.2)]">
            <Flame className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-pink-300 font-bold flex items-center gap-1.5">
              Entropy & Volatility Spikes
              <span className="text-[8px] font-normal text-slate-500">[{data.length} pts]</span>
            </h3>
            <p className="text-[8px] font-mono text-slate-400 flex items-center gap-1">
              Correlated Inputs &bull; Volatility: <span className={`px-1 rounded border text-[7px] font-bold ${volatilityColor}`}>{volatilityLabel}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetHistory}
            className="p-1 bg-white/5 hover:bg-white/10 rounded text-slate-500 hover:text-pink-300 transition-colors"
            title="Reset Entropy Spike History"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1 bg-white/5 hover:bg-white/10 rounded text-slate-400 hover:text-pink-300 transition-colors"
            title="Expand Volatility Correlation Analysis"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Volatility Mini Metrics Banner */}
      <div className="grid grid-cols-3 gap-1.5 mb-2 text-[8px] font-mono text-center">
        <div className="bg-white/5 rounded border border-white/5 p-1">
          <span className="text-slate-500 block uppercase">Peak Entropy</span>
          <span className="text-pink-300 font-bold text-[10px]">{maxEntropy}%</span>
        </div>
        <div className="bg-white/5 rounded border border-white/5 p-1">
          <span className="text-slate-500 block uppercase">Spike Events</span>
          <span className="text-amber-300 font-bold text-[10px]">{spikeCount}</span>
        </div>
        <div className="bg-white/5 rounded border border-white/5 p-1">
          <span className="text-slate-500 block uppercase">Avg Chaos</span>
          <span className="text-cyan-300 font-bold text-[10px]">{avgEntropy}%</span>
        </div>
      </div>

      {/* Main Recharts Area Chart for Entropy */}
      <div className="w-full h-32 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="entropyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f472b6" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#f472b6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis
              dataKey="timeStr"
              tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'monospace' }}
              stroke="rgba(255, 255, 255, 0.1)"
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 8, fontFamily: 'monospace' }}
              stroke="rgba(255, 255, 255, 0.1)"
            />
            <Tooltip content={<CustomTooltip onSelectSpike={setSelectedSpike} />} />
            <Area
              type="monotone"
              dataKey="entropy"
              name="Entropy / Chaos Level"
              stroke="#f472b6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#entropyGradient)"
              isAnimationActive={false}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.isSpike) {
                  return (
                    <circle
                      key={`dot-${payload.timestamp}`}
                      cx={cx}
                      cy={cy}
                      r={3.5}
                      fill="#ec4899"
                      stroke="#fbcfe8"
                      strokeWidth={1.5}
                      className="animate-ping"
                    />
                  );
                }
                return <circle key={`dot-${payload.timestamp}`} cx={cx} cy={cy} r={1.5} fill="#f472b6" opacity={0.4} />;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Selected Spike Correlation Details Footer */}
      {selectedSpike ? (
        <div className="mt-2 p-1.5 bg-pink-950/30 border border-pink-500/30 rounded text-[8px] font-mono text-pink-200 flex items-center justify-between">
          <span>
            Spike at <strong>{selectedSpike.timeStr}</strong> ({selectedSpike.entropy}%): {selectedSpike.eventCorrelation}
          </span>
          <button onClick={() => setSelectedSpike(null)} className="text-slate-400 hover:text-white ml-2">
            &times;
          </button>
        </div>
      ) : (
        <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-500">
          <span>Hover over points to inspect event correlations</span>
          <span className="text-pink-400/80 uppercase">Correlated Volatility</span>
        </div>
      )}

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c0814] border border-pink-500/30 rounded-2xl p-6 w-full max-w-3xl flex flex-col gap-4 shadow-[0_0_50px_rgba(244,114,182,0.2)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-pink-400 animate-pulse" />
                  <div>
                    <h2 className="text-sm font-mono uppercase tracking-[0.25em] text-pink-200 font-bold">
                      System Volatility & Input Event Correlation
                    </h2>
                    <p className="text-[10px] font-mono text-slate-400">
                      Linking entropy/noise level spikes directly to acoustic inputs, perturbations, and phase shifts
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

              {/* Large Area Chart */}
              <div className="w-full h-72 bg-black/40 border border-white/5 rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="entropyExpandedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f472b6" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#f472b6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
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
                    <Tooltip content={<CustomTooltip onSelectSpike={setSelectedSpike} />} />
                    <Area
                      type="monotone"
                      dataKey="entropy"
                      name="Entropy Level (%)"
                      stroke="#f472b6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#entropyExpandedGradient)"
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        if (payload.isSpike) {
                          return (
                            <circle
                              key={`exp-dot-${payload.timestamp}`}
                              cx={cx}
                              cy={cy}
                              r={5}
                              fill="#ec4899"
                              stroke="#ffffff"
                              strokeWidth={2}
                            />
                          );
                        }
                        return <circle key={`exp-dot-${payload.timestamp}`} cx={cx} cy={cy} r={2} fill="#f472b6" opacity={0.6} />;
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Spike Correlation History Feed */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500/20 p-2 bg-black/40 rounded-xl border border-white/5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                  Correlated Event Stream:
                </span>
                {data.filter(d => d.isSpike).slice(-6).map((spike, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-pink-950/20 border border-pink-500/20 p-2 rounded text-[10px] font-mono">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-pink-400" />
                      <span className="text-slate-300">[{spike.timeStr}]</span>
                      <strong className="text-pink-300">{spike.eventCorrelation}</strong>
                    </div>
                    <span className="text-pink-400 font-bold">{spike.entropy}% Noise</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* Custom Tooltip */
const CustomTooltip = ({ active, payload, label, onSelectSpike }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload as EntropyPoint;
    return (
      <div className="bg-[#0c0814]/95 border border-pink-500/50 p-2.5 rounded-lg shadow-2xl text-[9px] font-mono space-y-1 min-w-[180px]">
        <div className="flex justify-between items-center border-b border-white/10 pb-1 text-slate-300 font-bold">
          <span>Time: {label}</span>
          <span className="text-pink-400 uppercase">Phase: {point.phase}</span>
        </div>
        <div className="flex justify-between text-pink-300">
          <span>Entropy/Chaos:</span>
          <strong className="text-sm">{point.entropy}%</strong>
        </div>
        {point.acousticVolume > 0 && (
          <div className="flex justify-between text-rose-300">
            <span>Acoustic Vol:</span>
            <strong>{point.acousticVolume}%</strong>
          </div>
        )}
        <div className="pt-1 border-t border-white/10 text-slate-400 italic">
          Trigger: <span className="text-slate-200 font-normal">{point.eventCorrelation}</span>
        </div>
      </div>
    );
  }
  return null;
};
