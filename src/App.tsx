import React, { useState, useCallback, useEffect, useRef } from 'react';
import { NeuralGrid } from './components/NeuralGrid';
import { ConsciousnessMonitor } from './components/ConsciousnessMonitor';
import { MousePointer2, Info, Volume2, VolumeX, Send, Mic, MicOff } from 'lucide-react';
import { motion } from 'motion/react';

import { Cluster, InternalMarker, GhostTrace, SystemDNA, CyclePhase, Stats, PruningAuditRecord, EventDNASnapshot } from './engine/Core';
import { AudioEngine } from './engine/AudioEngine';
import { AudioInput } from './engine/AudioInputEngine';

export default function App() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [concept, setConcept] = useState("");
  const [activeConcept, setActiveConcept] = useState("");
  const [stats, setStats] = useState<Stats>({ 
    nodeCount: 0, 
    edgeCount: 0, 
    avgStrength: 0,
    clusters: [] as Cluster[],
    markers: [] as InternalMarker[],
    ghosts: [] as GhostTrace[],
    anomalySnapshots: [] as EventDNASnapshot[],
    dna: {
      coherence_bias: 0.5,
      noise_level: 0.2,
      memory_weight: 0.5,
      recovery_rate: 0.3,
      drift: 0.05
    } as SystemDNA,
    phase: 'Calm' as CyclePhase,
    events: [] as string[],
    phaseDominance: {
      'Calm': 0,
      'Growth': 0,
      'Tension': 0,
      'Collapse': 0
    } as Record<CyclePhase, number>,
    ghostCount: 0,
    redFlags: [],
    fossilRecord: [],
    audit: {
      prune_integrity_score: 0,
      uncertainty_preservation_score: 0,
      calm_pulse_frequency: 0,
      contradiction_resolution_quality: 0,
      ghosttrace_peak: 0,
      memory_prune_events: 0,
      time_to_synthesis: 0,
      hyper_sync_events: 0,
      fragmentation_events: 0
    }
  });

  const lastPruneEvents = useRef(0);

  const handleStateUpdate = useCallback((newStats: Stats) => {
    setStats(newStats);
    
    if (audioEnabled) {
      AudioEngine.update(newStats.phase, newStats.phaseDominance);
      if (newStats.audit.memory_prune_events > lastPruneEvents.current) {
        AudioEngine.triggerSnap();
        lastPruneEvents.current = newStats.audit.memory_prune_events;
      }
    }
  }, [audioEnabled]);

  const toggleAudio = () => {
    if (!audioEnabled) {
      AudioEngine.init();
      AudioEngine.resume();
      setAudioEnabled(true);
    } else {
      if (AudioEngine.masterGain) {
         AudioEngine.masterGain.gain.value = 0; // Mute
      }
      setAudioEnabled(false);
    }
  };

  useEffect(() => {
    if (audioEnabled && AudioEngine.masterGain) {
       AudioEngine.masterGain.gain.value = 0.5;
       AudioEngine.update(stats.phase, stats.phaseDominance);
    }
  }, [audioEnabled]);

  const toggleListening = async () => {
    if (!listening) {
      const success = await AudioInput.startListening();
      if (success) setListening(true);
    } else {
      AudioInput.stopListening();
      setListening(false);
    }
  };

  const handleInjectConcept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;
    setActiveConcept(concept.trim());
    setConcept('');
    // Large perturbation event for concept injection
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
           window.dispatchEvent(new CustomEvent('perturb-field'));
        }, i * 200);
    }
  };

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
      <ConsciousnessMonitor stats={stats} activeConcept={activeConcept} />

      {/* User Controls Intro */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20 pointer-events-auto"
      >
        <form onSubmit={handleInjectConcept} className="flex gap-2 w-72">
           <input 
              type="text" 
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Inject concept (e.g. 'Ocean')"
              className="bg-black/50 border border-white/10 text-cyan-100 rounded-full py-2 px-5 text-[11px] font-mono w-full focus:outline-none focus:border-cyan-500/50 backdrop-blur-md"
              maxLength={20}
           />
           <button 
             type="submit" 
             className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-full h-[34px] w-[34px] flex items-center justify-center hover:bg-cyan-500/40 transition-colors flex-shrink-0"
           >
             <Send className="w-3.5 h-3.5" />
           </button>
        </form>

        <div className="flex items-center gap-4">
          <div 
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-2 px-6 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('perturb-field'));
            }}
          >
            <MousePointer2 className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-slate-400 font-bold">
              Perturb the field
            </span>
          </div>

          <div 
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-2 px-4 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors"
            onClick={toggleAudio}
            title="Toggle Engine Audio Output"
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </div>
          
          <div 
            className={`backdrop-blur-md border border-white/10 rounded-full py-2 px-4 flex items-center gap-3 cursor-pointer transition-colors ${listening ? 'bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-white/5 hover:bg-white/10'}`}
            onClick={toggleListening}
            title="Enable Microphone (Environmental Sound Input)"
          >
            {listening ? (
              <Mic className="w-4 h-4 text-rose-400 animate-pulse" />
            ) : (
              <MicOff className="w-4 h-4 text-slate-500" />
            )}
          </div>
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

