import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Dna, Activity, Zap, Shield, Sparkles } from 'lucide-react';
import { SystemDNA } from '../engine/Core';

interface DNAVisualizerProps {
  dna: SystemDNA;
  className?: string;
}

interface DNAHistoryPoint {
  coherence: number;
  noise: number;
  memory: number;
  drift: number;
  time: number;
}

interface GaugeMetric {
  key: keyof Omit<DNAHistoryPoint, 'time'>;
  label: string;
  sublabel: string;
  value: number;
  color: string;
  strokeColor: string;
  glowClass: string;
  bgGradient: string;
  icon: React.ReactNode;
}

const MAX_HISTORY_POINTS = 24;

export const DNAVisualizer: React.FC<DNAVisualizerProps> = ({ dna, className = '' }) => {
  const [history, setHistory] = useState<DNAHistoryPoint[]>([]);
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const lastRecordedTime = useRef<number>(0);

  // Maintain real-time rolling history of DNA metrics
  useEffect(() => {
    const now = Date.now();
    // Throttle history collection to max ~4 times a second for smooth sparklines
    if (now - lastRecordedTime.current >= 250) {
      lastRecordedTime.current = now;      const newPoint: DNAHistoryPoint = {
        coherence: Math.max(0, Math.min(1, dna.coherence_bias)),
        noise: Math.max(0, Math.min(1, dna.noise_level)),
        memory: Math.max(0, Math.min(1, dna.memory_weight)),
        drift: Math.max(0, Math.min(1, dna.drift)),
        time: now,
      };

      setHistory((prev) => {
        const next = [...prev, newPoint];
        if (next.length > MAX_HISTORY_POINTS) {
          return next.slice(next.length - MAX_HISTORY_POINTS);
        }
        return next;
      });
    }
  }, [dna]);

  // Initial seed so sparklines render immediately
  useEffect(() => {
    if (history.length === 0) {
      const seedPoint: DNAHistoryPoint = {
        coherence: dna.coherence_bias,
        noise: dna.noise_level,
        memory: dna.memory_weight,
        drift: dna.drift,
        time: Date.now(),
      };
      setHistory(Array(10).fill(seedPoint));
    }
  }, []);

  const metrics: GaugeMetric[] = [
    {
      key: 'coherence',
      label: 'Coherence',
      sublabel: 'Structural Integrity',
      value: dna.coherence_bias,
      color: 'text-cyan-400',
      strokeColor: '#22d3ee',
      glowClass: 'shadow-[0_0_12px_rgba(34,211,238,0.4)]',
      bgGradient: 'from-cyan-500/20 to-cyan-900/10',
      icon: <Shield className="w-3.5 h-3.5 text-cyan-400" />,
    },
    {
      key: 'noise',
      label: 'Chaos / Noise',
      sublabel: 'System Entropy',
      value: dna.noise_level,
      color: 'text-pink-400',
      strokeColor: '#f472b6',
      glowClass: 'shadow-[0_0_12px_rgba(244,114,182,0.4)]',
      bgGradient: 'from-pink-500/20 to-pink-900/10',
      icon: <Activity className="w-3.5 h-3.5 text-pink-400" />,
    },
    {
      key: 'memory',
      label: 'Memory',
      sublabel: 'Historical Weight',
      value: dna.memory_weight,
      color: 'text-indigo-400',
      strokeColor: '#818cf8',
      glowClass: 'shadow-[0_0_12px_rgba(129,140,248,0.4)]',
      bgGradient: 'from-indigo-500/20 to-indigo-900/10',
      icon: <Zap className="w-3.5 h-3.5 text-indigo-400" />,
    },
    {
      key: 'drift',
      label: 'Mutance',
      sublabel: 'Evolution Drift',
      value: dna.drift,
      color: 'text-amber-400',
      strokeColor: '#fbbf24',
      glowClass: 'shadow-[0_0_12px_rgba(251,191,36,0.4)]',
      bgGradient: 'from-amber-500/20 to-amber-900/10',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
    },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Dna className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400 font-bold">
            System DNA Dynamic Matrix
          </span>
        </div>
        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
          Live Telemetry
        </span>
      </div>

      {/* 2x2 Circular Gauges Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {metrics.map((m) => {
          const pct = Math.round(m.value * 100);
          const historySeries = history.map((h) => h[m.key]);
          const isHovered = activeMetric === m.key;

          return (
            <motion.div
              key={m.key}
              onMouseEnter={() => setActiveMetric(m.key)}
              onMouseLeave={() => setActiveMetric(null)}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`relative bg-gradient-to-b ${m.bgGradient} border border-white/10 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden backdrop-blur-md transition-colors duration-200 hover:border-white/20`}
            >
              {/* Background Glow */}
              <div
                className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl opacity-20 bg-current ${m.color}`}
              />

              {/* Top row: Circular gauge + Label */}
              <div className="flex items-center gap-2.5 z-10">
                <CircularGauge
                  value={m.value}
                  strokeColor={m.strokeColor}
                  icon={m.icon}
                  glowClass={m.glowClass}
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-300 font-bold truncate">
                      {m.label}
                    </span>
                  </div>
                  <span className={`text-sm font-mono font-bold tracking-tight ${m.color}`}>
                    {pct}%
                  </span>
                  <span className="text-[7.5px] font-mono text-slate-500 truncate leading-none">
                    {m.sublabel}
                  </span>
                </div>
              </div>

              {/* Bottom: Sparkline chart */}
              <div className="mt-2 pt-1.5 border-t border-white/5 z-10 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[7px] font-mono text-slate-500">
                  <span>TREND</span>
                  <span className={m.color}>
                    {getDeltaText(historySeries)}
                  </span>
                </div>
                <Sparkline
                  data={historySeries}
                  strokeColor={m.strokeColor}
                  height={22}
                  isHovered={isHovered}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* Circular SVG Gauge Component */
interface CircularGaugeProps {
  value: number; // 0 to 1
  strokeColor: string;
  icon: React.ReactNode;
  glowClass: string;
}

const CircularGauge: React.FC<CircularGaugeProps> = ({ value, strokeColor, icon }) => {
  const size = 42;
  const strokeWidth = 3.5;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.max(0, Math.min(1, value));
  const strokeDashoffset = circumference * (1 - clampedValue);

  return (
    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Active Progress Circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      {/* Icon centered inside ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
};

/* Real-Time Sparkline Component */
interface SparklineProps {
  data: number[];
  strokeColor: string;
  height: number;
  isHovered?: boolean;
}

const Sparkline: React.FC<SparklineProps> = ({ data, strokeColor, height, isHovered }) => {
  if (data.length < 2) return <div style={{ height }} />;

  const width = 100; // SVG internal viewBox width
  const maxIdx = data.length - 1;

  // Map values (0-1) to SVG points
  const points = data.map((val, i) => {
    const x = (i / maxIdx) * width;
    const clampedVal = Math.max(0, Math.min(1, val));
    const y = height - clampedVal * (height - 4) - 2; // leave 2px padding
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  // Closed path for subtle gradient area fill underneath
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const lastPoint = points[points.length - 1];

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`grad-${strokeColor}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={isHovered ? 0.4 : 0.25} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Gradient fill */}
        <path d={areaD} fill={`url(#grad-${strokeColor})`} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth={isHovered ? 1.8 : 1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Live Pulse Tip Dot */}
        {lastPoint && (
          <motion.circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={isHovered ? 2.5 : 1.8}
            fill={strokeColor}
            animate={{ r: isHovered ? [2.5, 3.5, 2.5] : [1.8, 2.8, 1.8] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </svg>
    </div>
  );
};

// Helper to compute recent delta trend text (e.g. +2.4% or -1.1%)
function getDeltaText(series: number[]): string {
  if (series.length < 3) return 'STABLE';
  const latest = series[series.length - 1];
  const previous = series[Math.max(0, series.length - 6)];
  const delta = (latest - previous) * 100;

  if (Math.abs(delta) < 0.2) return 'EQUALIZED';
  if (delta > 0) return `+${delta.toFixed(1)}%`;
  return `${delta.toFixed(1)}%`;
}
