import { useState, useCallback } from 'react';
import { NeuralGrid } from './components/NeuralGrid';
import { ConsciousnessMonitor } from './components/ConsciousnessMonitor';
import { MousePointer2, Info } from 'lucide-react';
import { motion } from 'motion/react';

import { Cluster, InternalMarker, GhostTrace, SystemDNA, CyclePhase } from './engine/Core';

export default function App() {
  const [stats, setStats] = useState({ 
    nodeCount: 0, 
    edgeCount: 0, 
    avgStrength: 0,
    clusters: [] as Cluster[],
    markers: [] as InternalMarker[],
    ghosts: [] as GhostTrace[],
    dna: {
      coherence_bias: 0.5,
      noise_level: 0.2,
      memory_weight: 0.5,
      recovery_rate: 0.3,
      drift: 0.05
    } as SystemDNA,
    phase: 'Calm' as CyclePhase
  });

  const handleStateUpdate = useCallback((newStats: typeof stats) => {
    setStats(newStats);
  }, []);

  return (
    <div className="w-screen h-screen bg-[#02040a] text-slate-300 flex flex-col font-sans selection:bg-cyan-500/30 overflow-hidden relative border-8 border-[#0a0f1d]">
      {/* Background Grids and Blurs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-30 blur-[100px] rounded-full bg-cyan-500 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-20 blur-[80px] rounded-full bg-purple-600 animate-pulse pointer-events-none"></div>

      {/* Header from Design */}
      <header className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex flex-col">
          <h1 className="text-xs font-mono tracking-[0.4em] text-cyan-400 uppercase mb-1">Project: Lumina</h1>
          <p className="text-2xl font-light tracking-tight text-white">System: Unguided Emergence</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
          <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold">Autonomous State: Active</span>
        </div>
      </header>

      {/* Background Simulation */}
      <NeuralGrid onStateUpdate={handleStateUpdate} />

      {/* Overlay UI */}
      <ConsciousnessMonitor stats={stats} />

      {/* User Controls Intro */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-32 right-8 flex flex-col items-end gap-2 z-20"
      >
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-2 px-5 flex items-center gap-3">
          <MousePointer2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-slate-400 font-bold">
            Perturb the field
          </span>
        </div>
      </motion.div>

      {/* Footer from Design */}
      <footer className="absolute bottom-0 left-0 w-full p-8 z-20 border-t border-white/5 bg-[#02040a]/80 backdrop-blur-xl pointer-events-none">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.3em]">Iteration Runtime Status</p>
            <div className="flex gap-2">
              <div className="h-4 w-1 bg-cyan-500/20"></div>
              <div className="h-4 w-1 bg-cyan-500/40"></div>
              <div className="h-4 w-1 bg-cyan-500/10"></div>
              <div className="h-4 w-1 bg-cyan-500/60"></div>
              <div className="h-4 w-1 bg-cyan-500/30"></div>
              <div className="h-4 w-1 bg-cyan-500/10"></div>
              <div className="h-4 w-1 bg-cyan-500/50"></div>
              <div className="h-4 w-1 bg-cyan-500/90 shadow-[0_0_8px_#06b6d4]"></div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-mono text-slate-500">v0.9.4-ALPHA-NATURAL</p>
            <p className="text-xs text-white tracking-widest font-light">UNSUPERVISED LEARNING ACTIVE</p>
          </div>
        </div>
      </footer>

      {/* Aesthetic Overlays */}
      <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
    </div>
  );
}

