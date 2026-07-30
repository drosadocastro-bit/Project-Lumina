import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Dna, Maximize2, Minimize2, RefreshCw, Shield, Activity, Zap, Sparkles, Filter } from 'lucide-react';
import { SystemDNA, CyclePhase } from '../engine/Core';

interface DNADriftChartProps {
  dna: SystemDNA;
  phase: CyclePhase;
  className?: string;
}

export interface DNATrajectoryPoint {
  timeStr: string;
  timestamp: number;
  coherence: number; // 0 to 100
  noise: number;     // 0 to 100
  memory: number;    // 0 to 100
  drift: number;     // 0 to 100
  phase: CyclePhase;
}

const MAX_TRAJECTORY_POINTS = 60;
const STORAGE_KEY = 'lumina_dna_drift_history_v1';

export const DNADriftChart: React.FC<DNADriftChartProps> = ({ dna, phase, className = '' }) => {
  const [data, setData] = useState<DNATrajectoryPoint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleLines, setVisibleLines] = useState<{ [key: string]: boolean }>({
    coherence: true,
    noise: true,
    memory: true,
    drift: true,
  });

  const lastRecordedRef = useRef<number>(0);

  // Record DNA state snapshot periodically (~every 3 seconds)
  useEffect(() => {
    const now = Date.now();
    if (now - lastRecordedRef.current >= 3000) {
      lastRecordedRef.current = now;

      const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newPoint: DNATrajectoryPoint = {
        timeStr,
        timestamp: now,
        coherence: Number((Math.max(0, Math.min(1, dna.coherence_bias)) * 100).toFixed(1)),
        noise: Number((Math.max(0, Math.min(1, dna.noise_level)) * 100).toFixed(1)),
        memory: Number((Math.max(0, Math.min(1, dna.memory_weight)) * 100).toFixed(1)),
        drift: Number((Math.max(0, Math.min(1, dna.drift)) * 100).toFixed(1)),
        phase,
      };

      setData((prev) => {
        const updated = [...prev, newPoint];
        const trimmed = updated.length > MAX_TRAJECTORY_POINTS ? updated.slice(updated.length - MAX_TRAJECTORY_POINTS) : updated;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        } catch {
          // ignore storage error
        }
        return trimmed;
      });
    }
  }, [dna, phase]);

  // Seed initial dataset if empty
  useEffect(() => {
    if (data.length === 0) {
      const now = Date.now();
      const initialPoints: DNATrajectoryPoint[] = Array.from({ length: 8 }).map((_, idx) => {
        const t = now - (8 - idx) * 3000;
        return {
          timeStr: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          timestamp: t,
          coherence: Number((dna.coherence_bias * 100).toFixed(1)),
          noise: Number((dna.noise_level * 100).toFixed(1)),
          memory: Number((dna.memory_weight * 100).toFixed(1)),
          drift: Number((dna.drift * 100).toFixed(1)),
          phase,
        };
      });
      setData(initialPoints);
    }
  }, []);

  const toggleLine = (key: string) => {
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    const now = Date.now();
    const freshPoint: DNATrajectoryPoint = {
      timeStr: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestamp: now,
      coherence: Number((dna.coherence_bias * 100).toFixed(1)),
      noise: Number((dna.noise_level * 100).toFixed(1)),
      memory: Number((dna.memory_weight * 100).toFixed(1)),
      drift: Number((dna.drift * 100).toFixed(1)),
      phase,
    };
    setData([freshPoint]);
  };

  // Trajectory Assessment Logic
  const latestPoint = data[data.length - 1] || { coherence: 50, noise: 20, memory: 50, drift: 20 };
  const firstPoint = data[0] || latestPoint;
  const coherenceDelta = latestPoint.coherence - firstPoint.coherence;
  const memoryDelta = latestPoint.memory - firstPoint.memory;

  let personalityState = 'Balancing Symmetry';
  if (latestPoint.coherence > 70 && latestPoint.noise < 30) {
    personalityState = 'High Coherence Integration';
  } else if (latestPoint.noise > 60) {
    personalityState = 'High-Entropy Dissonance';
  } else if (latestPoint.memory > 70) {
    personalityState = 'Deep Memory Accumulation';
  } else if (latestPoint.drift > 50) {
    personalityState = 'Rapid Mutation & Exploration';
  }

  return (
    <div className={`bg-black/40 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl p-3 backdrop-blur-md transition-all ${className}`}>
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-300 font-bold flex items-center gap-1.5">
              System DNA Trajectory
              <span className="text-[8px] font-normal text-slate-500">[{data.length} pts]</span>
            </h3>
            <p className="text-[8px] font-mono text-slate-400">
              Evolutionary Drift: <strong className="text-cyan-400">{personalityState}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleResetHistory}
            className="p-1 bg-white/5 hover:bg-white/10 rounded text-slate-500 hover:text-cyan-300 transition-colors"
            title="Reset Drift Trajectory History"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1 bg-white/5 hover:bg-white/10 rounded text-slate-400 hover:text-cyan-300 transition-colors"
            title="Expand Trajectory Chart"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Trajectory Filters Legend */}
      <div className="flex items-center justify-between gap-1 mb-2 text-[8px] font-mono border-y border-white/5 py-1">
        <button
          onClick={() => toggleLine('coherence')}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all ${
            visibleLines.coherence
              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
              : 'bg-white/5 border-transparent text-slate-600 line-through'
          }`}
        >
          <Shield className="w-2.5 h-2.5 text-cyan-400" />
          <span>Coherence ({latestPoint.coherence}%)</span>
        </button>

        <button
          onClick={() => toggleLine('noise')}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all ${
            visibleLines.noise
              ? 'bg-pink-500/10 border-pink-500/40 text-pink-300'
              : 'bg-white/5 border-transparent text-slate-600 line-through'
          }`}
        >
          <Activity className="w-2.5 h-2.5 text-pink-400" />
          <span>Noise ({latestPoint.noise}%)</span>
        </button>

        <button
          onClick={() => toggleLine('memory')}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all ${
            visibleLines.memory
              ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
              : 'bg-white/5 border-transparent text-slate-600 line-through'
          }`}
        >
          <Zap className="w-2.5 h-2.5 text-indigo-400" />
          <span>Memory ({latestPoint.memory}%)</span>
        </button>

        <button
          onClick={() => toggleLine('drift')}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-all ${
            visibleLines.drift
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              : 'bg-white/5 border-transparent text-slate-600 line-through'
          }`}
        >
          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          <span>Drift ({latestPoint.drift}%)</span>
        </button>
      </div>

      {/* Main Recharts Line Chart Container */}
      <div className="w-full h-32 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
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
            <Tooltip content={<CustomTooltip />} />
            {visibleLines.coherence && (
              <Line
                type="monotone"
                dataKey="coherence"
                name="Coherence"
                stroke="#22d3ee"
                strokeWidth={1.8}
                dot={false}
                activeDot={{ r: 4, fill: '#22d3ee', stroke: '#080d1a', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            )}
            {visibleLines.noise && (
              <Line
                type="monotone"
                dataKey="noise"
                name="Chaos/Noise"
                stroke="#f472b6"
                strokeWidth={1.8}
                dot={false}
                activeDot={{ r: 4, fill: '#f472b6', stroke: '#080d1a', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            )}
            {visibleLines.memory && (
              <Line
                type="monotone"
                dataKey="memory"
                name="Memory Weight"
                stroke="#818cf8"
                strokeWidth={1.8}
                dot={false}
                activeDot={{ r: 4, fill: '#818cf8', stroke: '#080d1a', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            )}
            {visibleLines.drift && (
              <Line
                type="monotone"
                dataKey="drift"
                name="Drift/Mutance"
                stroke="#fbbf24"
                strokeWidth={1.8}
                dot={false}
                activeDot={{ r: 4, fill: '#fbbf24', stroke: '#080d1a', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Summary Footnote */}
      <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-500">
        <span>
          Coherence Drift: <span className={coherenceDelta >= 0 ? 'text-emerald-400' : 'text-pink-400'}>{coherenceDelta >= 0 ? `+${coherenceDelta.toFixed(1)}%` : `${coherenceDelta.toFixed(1)}%`}</span>
        </span>
        <span>
          Memory Build: <span className={memoryDelta >= 0 ? 'text-indigo-300' : 'text-slate-400'}>{memoryDelta >= 0 ? `+${memoryDelta.toFixed(1)}%` : `${memoryDelta.toFixed(1)}%`}</span>
        </span>
      </div>

      {/* Expanded Modal View */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#080d1a] border border-cyan-500/30 rounded-2xl p-6 w-full max-w-3xl flex flex-col gap-4 shadow-[0_0_50px_rgba(34,211,238,0.2)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <Dna className="w-5 h-5 text-cyan-400 animate-spin" />
                  <div>
                    <h2 className="text-sm font-mono uppercase tracking-[0.25em] text-cyan-200 font-bold">
                      System DNA Historical Trajectory Analysis
                    </h2>
                    <p className="text-[10px] font-mono text-slate-400">
                      Tracking shift of personality vector over {data.length} continuous snapshots
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

              {/* Large Chart Area */}
              <div className="w-full h-80 bg-black/40 border border-white/5 rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
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
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', color: '#cbd5e1' }} />
                    {visibleLines.coherence && (
                      <Line
                        type="monotone"
                        dataKey="coherence"
                        name="Coherence Bias (%)"
                        stroke="#22d3ee"
                        strokeWidth={2.5}
                        dot={{ r: 2, fill: '#22d3ee' }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {visibleLines.noise && (
                      <Line
                        type="monotone"
                        dataKey="noise"
                        name="Chaos/Noise Level (%)"
                        stroke="#f472b6"
                        strokeWidth={2.5}
                        dot={{ r: 2, fill: '#f472b6' }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {visibleLines.memory && (
                      <Line
                        type="monotone"
                        dataKey="memory"
                        name="Memory Weight (%)"
                        stroke="#818cf8"
                        strokeWidth={2.5}
                        dot={{ r: 2, fill: '#818cf8' }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {visibleLines.drift && (
                      <Line
                        type="monotone"
                        dataKey="drift"
                        name="Mutance Drift (%)"
                        stroke="#fbbf24"
                        strokeWidth={2.5}
                        dot={{ r: 2, fill: '#fbbf24' }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Trajectory Breakdown Grid */}
              <div className="grid grid-cols-4 gap-3 text-[10px] font-mono">
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2.5 text-center">
                  <span className="text-slate-400 block uppercase text-[8px]">Latest Coherence</span>
                  <span className="text-cyan-300 text-sm font-bold">{latestPoint.coherence}%</span>
                </div>
                <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-2.5 text-center">
                  <span className="text-slate-400 block uppercase text-[8px]">Latest Chaos/Noise</span>
                  <span className="text-pink-300 text-sm font-bold">{latestPoint.noise}%</span>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-2.5 text-center">
                  <span className="text-slate-400 block uppercase text-[8px]">Latest Memory Weight</span>
                  <span className="text-indigo-300 text-sm font-bold">{latestPoint.memory}%</span>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 text-center">
                  <span className="text-slate-400 block uppercase text-[8px]">Latest Drift</span>
                  <span className="text-amber-300 text-sm font-bold">{latestPoint.drift}%</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* Custom Tooltip Component for Recharts */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as DNATrajectoryPoint;
    return (
      <div className="bg-[#080d1a]/95 border border-cyan-500/40 p-2.5 rounded-lg shadow-xl text-[9px] font-mono space-y-1">
        <div className="flex justify-between items-center gap-3 border-b border-white/10 pb-1 text-slate-300 font-bold">
          <span>Time: {label}</span>
          <span className="text-cyan-400 uppercase">Phase: {dataPoint.phase}</span>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex justify-between gap-4" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span className="font-bold">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
