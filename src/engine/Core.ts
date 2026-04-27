/**
 * Neural Engine: A simple simulation of emergent patterns.
 */

export interface SystemDNA {
  coherence_bias: number; // 0-1
  noise_level: number;    // 0-1
  memory_weight: number;  // 0-1
  recovery_rate: number;  // 0-1
  drift: number;          // 0-1
}

export type CyclePhase = 'Calm' | 'Growth' | 'Tension' | 'Collapse';

export interface Node {
  id: string;
  x: number;
  y: number;
  energy: number;
  pulseRef: number;
  phase: number;
  frequency: number;
  lastPulse: number;
}

export interface Edge {
  fromId: string;
  toId: string;
  strength: number; // 0 to 1
  activity: number; // transient activity for visualization
}

export interface InternalMarker {
  type: string;
  intensity: number;
  label: string;
}

export interface Cluster {
  id: string;
  size: number;
  resonance: number;
}

export interface GhostTrace {
  x: number;
  y: number;
  frequency: number;
  phase: number;
  energy: number; // 0 to 1, decays slowly
  fragment?: string;
}

export const MEMORY_FRAGMENTS = [
  "echo of a heartbeat",
  "fractured promise",
  "lingering doubt",
  "a sudden realization",
  "the tension of waiting",
  "ghost of a connection",
  "structural anchor",
  "an obsolete protocol",
  "unprocessed grief",
  "the sound of silence",
  "recursive loop detected",
  "data without context"
];

export interface PruningAuditRecord {
  event_id: string;
  timestamp: string;
  protocol: string;
  trigger: string;
  ghost_count_before: number;
  ghost_count_after: number;
  threshold_state: string;
  compaction_type: string;
  continuity_impact: "low" | "medium" | "high";
  contradiction_impact: "reduced" | "neutral" | "increased";
  calm_percentage: number;
  growth_percentage: number;
  tension_percentage: number;
  synthesis_latency_seconds: number;
  hyper_sync_count: number;
  red_flags_active: string[];
  raw_log_preserved: boolean;
}

export interface EventDNASnapshot {
  timestamp: number;
  eventType: 'Hyper-Sync' | 'Fragmentation' | 'Acoustic-Shift' | 'Memory-Flood';
  triggerVolume?: number;
  dnaSnapshot: SystemDNA;
  phase: CyclePhase;
}

export interface AcousticPhaseShiftRecord {
  time: number;
  interruptedPhase: CyclePhase;
  newPhase: CyclePhase;
  triggerVolume: number;
}

export interface Stats {
  nodeCount: number;
  edgeCount: number;
  avgStrength: number;
  clusters: Cluster[];
  markers: InternalMarker[];
  ghosts: GhostTrace[];
  anomalySnapshots: EventDNASnapshot[];
  dna: SystemDNA;
  phase: CyclePhase;
  events: string[];
  phaseDominance: Record<CyclePhase, number>;
  ghostCount: number;
  redFlags: string[];
  audit: {
    prune_count_total: number;
    prunes_per_10000_ticks: number;
    prune_integrity_score: number;
    integrity_decay_rate: number;
    lowest_integrity_observed: number;
    collapse_count: number;
    collapse_recovery_count: number;
    post_collapse_growth_spike: number;
    uncertainty_preservation_score: number;
    calm_pulse_frequency: number;
    contradiction_resolution_quality: number;
    ghosttrace_peak: number;
    memory_prune_events: number;
    time_to_synthesis: number;
    hyper_sync_events: number;
    fragmentation_events: number;
    acoustic_energy_injected: number;
    acoustic_ghosts_spawned: number;
    acoustic_phase_shifts: number;
    current_acoustic_volume: number;
    acoustic_phase_shift_log: AcousticPhaseShiftRecord[];
  };
  lastPrune?: PruningAuditRecord;
  fossilRecord: PruningAuditRecord[];
}

export class NeuralEngine {
  nodes: Node[] = [];
  edges: Map<string, Edge> = new Map();
  width: number;
  height: number;
  
  clusters: Cluster[] = [];
  markers: InternalMarker[] = [];
  ghosts: GhostTrace[] = [];
  
  // Tension mechanics
  tension: number = 0;
  globalPulse: number = 0;

  // Evolution Layer
  dna: SystemDNA = {
    coherence_bias: 0.6,
    noise_level: 0.1,
    memory_weight: 0.6, // Increased from 0.4 - Baseline Memory Saturation
    recovery_rate: 0.5, // Increased from 0.3 - Hardened Recovery
    drift: 0.05
  };
  phase: CyclePhase = 'Calm';
  private tickCount: number = 0;
  private phaseTicksRemaining: number = 2000; // Frames
  private events: string[] = [];
  private phaseDurations: Record<CyclePhase, number> = {
    'Calm': 0,
    'Growth': 0,
    'Tension': 0,
    'Collapse': 0
  };
  private totalTicks: number = 0;

  // Audit Metrics
  private ghostPeak: number = 0;
  private pruneEvents: number = 0;
  private hyperSyncCount: number = 0;
  private fragmentationCount: number = 0;
  private lastSynthesisTime: number = 0;
  private synthesisStartTick: number = 0;
  private calmPulses: number = 0;
  
  // Acoustic Tracking
  private acousticEnergyInjected: number = 0;
  private acousticGhostsSpawned: number = 0;
  private acousticPhaseShifts: number = 0;
  private currentAcousticVolume: number = 0;
  private acousticPhaseShiftLog: AcousticPhaseShiftRecord[] = [];
  private anomalySnapshots: EventDNASnapshot[] = [];

  private lowestIntegrityObserved: number = 0.95;
  private collapseCount: number = 0;
  private collapseRecoveryCount: number = 0;
  private postCollapseGrowthSpikes: number = 0;
  private lastAuditRecord: PruningAuditRecord | undefined;
  private fossilRecord: PruningAuditRecord[] = [];
  private redFlags: string[] = [];
  
  private auditMetrics = {
    integrity: 0.95,
    uncertainty: 0.4,
    resolution: 0.8
  };

  constructor(width: number, height: number, nodeCount: number = 40) {
    this.width = width;
    this.height = height;
    this.init(nodeCount);
  }

  private init(count: number) {
    for (let i = 0; i < count; i++) {
        // ... (rest of init)
      this.nodes.push({
        id: `node_${i}`,
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        energy: Math.random(),
        pulseRef: 0,
        phase: Math.random() * Math.PI * 2,
        frequency: 0.5 + Math.random() * 1.5,
        lastPulse: 0,
      });
    }
  }

  update(dt: number, time: number, audioVolume: number = 0) {
    this.tickCount++;
    this.totalTicks++;
    this.phaseDurations[this.phase]++;

    this.currentAcousticVolume = audioVolume;

    if (audioVolume > 0.4) {
      // --- SHARP LOUD AUDIO ---
      // increases Tension
      // creates acoustic GhostTraces
      // may trigger fragmentation warning
      // capped to avoid runaway stress

      // 1. Cap to avoid runaway stress
      const stressAmount = Math.min(audioVolume * 0.05, 0.2);
      this.dna.noise_level = Math.min(0.8, this.dna.noise_level + stressAmount); // Capped to 0.8
      
      // 2. Inject energy into random nodes based on volume
      const targetNodesCount = Math.floor(audioVolume * 15);
      const affectedNodeIds: number[] = [];
      for (let i = 0; i < targetNodesCount; i++) {
        const nodeIndex = Math.floor(Math.random() * this.nodes.length);
        const node = this.nodes[nodeIndex];
        if (node) {
          node.energy = Math.min(2.0, node.energy + audioVolume * 0.5);
          node.pulseRef = time;
          affectedNodeIds.push(nodeIndex);
          this.acousticEnergyInjected += audioVolume * 0.5;
        }
      }

      // Audio-Induced Synaptic Resonance (Audio forcing nodes to connect)
      if (affectedNodeIds.length > 1) {
        for (let i = 0; i < affectedNodeIds.length - 1; i++) {
           const idA = affectedNodeIds[i];
           const idB = affectedNodeIds[i + 1];
           const edgeKey = idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
           
           if (!this.edges.has(edgeKey)) {
              this.edges.set(edgeKey, { 
                fromId: this.nodes[idA].id, 
                toId: this.nodes[idB].id, 
                strength: audioVolume, 
                activity: 1.0 
              });
           } else {
              const edge = this.edges.get(edgeKey)!;
              edge.strength = Math.min(1.0, edge.strength + audioVolume * 0.5);
           }
        }
      }
      
      // 3. Create ghost structures from loud sound
      if (Math.random() < audioVolume) {
        this.acousticGhostsSpawned++;
        this.ghosts.push({
          x: this.width / 2 + (Math.random() - 0.5) * this.width * audioVolume,
          y: this.height / 2 + (Math.random() - 0.5) * this.height * audioVolume,
          frequency: 1.0 + Math.random(),
          phase: Math.random() * Math.PI * 2,
          energy: Math.min(0.8, audioVolume),
          fragment: `acoustic_shock_${Math.floor(Date.now() % 1000)}`
        });
      }
      
      // 4. May trigger fragmentation warning
      if (audioVolume > 0.7 && Math.random() < 0.1) {
         if (!this.events.includes("Acoustic Fragmentation Warning")) {
            this.events.push("Acoustic Fragmentation Warning");
         }
      }

      // 5. Increases Tension
      if (this.phase === 'Calm' || this.phase === 'Collapse' || this.phase === 'Growth') {
         // Only shift if it's really loud
         if (Math.random() < 0.3) {
             this.acousticPhaseShifts++;
             const interruptedPhase = this.phase;
             const newPhase = 'Tension';
             this.phase = newPhase;
             
             this.acousticPhaseShiftLog.unshift({
               time: Date.now(),
               interruptedPhase,
               newPhase,
               triggerVolume: audioVolume
             });
             
             if (this.acousticPhaseShiftLog.length > 5) {
               this.acousticPhaseShiftLog.pop();
             }

             this.anomalySnapshots.unshift({
              timestamp: Date.now(),
              eventType: 'Acoustic-Shift',
              triggerVolume: audioVolume,
              dnaSnapshot: { ...this.dna },
              phase: interruptedPhase
             });
             if (this.anomalySnapshots.length > 10) this.anomalySnapshots.pop();
         }
      }

    } else if (audioVolume > 0.02) {
       // --- QUIET STEADY AUDIO ---
       // Default interaction mode should be stabilizing, not harmful.
       // decreases noise_level slowly
       // slightly improves integrity recovery
       // reinforces Calm pulse
       // reduces chance of Collapse -> violent Growth jump

       this.dna.noise_level = Math.max(0.1, this.dna.noise_level - 0.005);
       this.dna.recovery_rate = Math.min(1.0, this.dna.recovery_rate + 0.001); // Improve recovery
       this.auditMetrics.integrity = Math.min(1.0, this.auditMetrics.integrity + 0.0005);
       
       // Light energy injection (soothing)
       const targetNodesCount = Math.floor(audioVolume * 10) || 1;
       for (let i = 0; i < targetNodesCount; i++) {
         const node = this.nodes[Math.floor(Math.random() * this.nodes.length)];
         if (node) {
           // Help synchronize node phase slightly instead of just dumping heavy energy
           node.phase += (this.nodes[0].phase - node.phase) * 0.05;
           node.energy = Math.min(1.2, node.energy + audioVolume * 0.2);
           this.acousticEnergyInjected += audioVolume * 0.1;
         }
       }

       // Reinforce Calm Phase
       if (this.phase === 'Collapse') {
         if (Math.random() < 0.05) { // Slow, gentle recovery from collapse rather than explosive growth
            this.phase = 'Calm';
            this.events.push("Soothing Recovery to Calm");
         }
       } else if (this.phase === 'Tension' && Math.random() < 0.02) {
          this.phase = 'Calm';
          this.events.push("Acoustic De-escalation");
       } else if (this.phase === 'Growth' && Math.random() < 0.01) {
          this.phase = 'Calm';
       }
    }

    const ghostCurrent = this.ghosts.length;
    this.redFlags = [];

    // SATURATION THRESHOLDS
    if (ghostCurrent > 700) {
      this.redFlags.push("DANGER: SATURATION CRITICAL (>700)");
      this.dna.noise_level = Math.max(0.8, this.dna.noise_level);
      // Force stabilization protocol by slowing down growth
      if (this.phase === 'Growth') {
        this.phaseTicksRemaining -= 200; // Accelerated exit from growth
      }
    } else if (ghostCurrent > 650) {
      this.redFlags.push("WARNING: ADAPTIVE CEILING REACHED");
    } else if (ghostCurrent > 400) {
      this.redFlags.push("INFO: SOFT SATURATION DETECTED");
    }

    // CALM PROTECTION
    const dominance = this.getPhaseDominance();
    if (dominance['Calm'] < 0.03 && this.totalTicks > 5000) {
      this.redFlags.push("CRITICAL: CALM SUPPRESSION (<3%)");
    }

    // GROWTH DOMINANCE
    if (dominance['Growth'] > 0.85 && this.totalTicks > 5000) {
      this.redFlags.push("WARNING: EXTENDED GROWTH DOMINANCE (>85%)");
    }

    // RESOLUTION ANOMALIES
    if (this.lastSynthesisTime > 0 && this.lastSynthesisTime < 500) {
       this.redFlags.push("CAUTION: SUSPICIOUSLY FAST SYNTHESIS (Oversimplification risk)");
    }
    
    // PRUNING FREQUENCY ANOMALY
    if (this.pruneEvents > 0 && (this.pruneEvents / (this.totalTicks / 100)) > 1.5) {
      this.redFlags.push("WARNING: CONSTANT PRUNING DETECTED");
    }

    // --- EVOLUTION MACRO-LOOP ---
    if (this.tickCount % 60 === 0) {
      this.evolveSystem();
    }

    // Memory Decay: Ghosts fade slowly. Modulated by recovery_rate
    const memoryDecay = 0.9992 - (this.dna.recovery_rate * 0.0005);
    const beforeCount = this.ghosts.length;
    
    this.ghosts = this.ghosts.filter(g => {
      g.energy *= memoryDecay;
      return g.energy > 0.05;
    });

    // PRUNING LOGIC: If ghosts exceed threshold, perform aggressive compaction
    if (this.ghosts.length > 600 && this.tickCount % 120 === 0) {
      this.performMemoryPruning();
    }

    if (this.ghosts.length > this.ghostPeak) this.ghostPeak = this.ghosts.length;

    // Update nodes
    this.nodes.forEach(node => {
      // Natural oscillation
      node.pulseRef = Math.sin(time * node.frequency + node.phase);
      
      // Decay activity
      node.energy *= 0.95;

      // MEMORY BIAS (Evolution Influenced): Sense nearby ghosts and pull phase/frequency towards them
      this.ghosts.forEach(ghost => {
        const d = Math.hypot(node.x - ghost.x, node.y - ghost.y);
        if (d < 120) {
          const influence = (1 - d / 120) * ghost.energy * dt * 0.15 * this.dna.memory_weight;
          node.phase += (ghost.phase - node.phase) * influence;
          node.frequency += (ghost.frequency - node.frequency) * influence * 0.05;
        }
      });

      // Pulse detection
      if (node.pulseRef > 0.9 && (time - node.lastPulse) > (1 / node.frequency) * 0.5) {
        node.energy = 1.0;
        node.lastPulse = time;
        this.emitPulse(node);

        // LEAVE RESIDUE: Active pulsing creates ghosts
        if (Math.random() < 0.05 * this.dna.memory_weight * 2) {
          const fragmentText = MEMORY_FRAGMENTS[Math.floor(Math.random() * MEMORY_FRAGMENTS.length)];
          this.ghosts.push({
            x: node.x,
            y: node.y,
            frequency: node.frequency,
            phase: node.phase,
            energy: 0.4,
            fragment: fragmentText
          });
        }
      }

      // NOISE & TENSION FORCE (Evolution Influenced)
      if (this.tension > 0.5 || this.dna.noise_level > 0.3) {
        node.phase += (Math.random() - 0.5) * dt * (this.tension + this.dna.noise_level);
        // Add actual spatial jitter so it visually shivers
        node.x += (Math.random() - 0.5) * this.dna.noise_level * 2;
        node.y += (Math.random() - 0.5) * this.dna.noise_level * 2;
      }
    });

    // Update edges
    this.edges.forEach((edge, key) => {
      edge.activity *= 0.9;
      
      // DYNAMIC GROWTH/DECAY FIGHT (Evolution Influenced)
      const decayBase = 0.9995 + (this.dna.coherence_bias * 0.0003); // More coherence = less base decay
      const tensionDecay = 1 - (this.tension * 0.005);
      edge.strength *= (decayBase * tensionDecay);
      
      if (edge.strength < 0.01) {
        this.edges.delete(key);
      }
    });

    // Internalization: Every few frames, assess own state
    if (Math.random() < 0.02) {
      this.analyzeInternalState();
    }
  }

  // === EVOLUTION LAYER METHODS ===

  private performMemoryPruning() {
    const before = this.ghosts.length;
    // Remove lowest energy ghosts first, and some random "duplicate" low signal ones
    this.ghosts.sort((a, b) => b.energy - a.energy);
    
    // Hard limit at 600 for performance stability
    this.ghosts = this.ghosts.slice(0, 580);
    const after = this.ghosts.length;
    
    this.pruneEvents++;
    const dominance = this.getPhaseDominance();
    const timestampStr = new Date().toISOString();
    
    this.lastAuditRecord = {
      event_id: `prune_${timestampStr.replace(/\D/g, '').slice(0, 14)}_${this.pruneEvents.toString().padStart(3, '0')}`,
      timestamp: timestampStr,
      protocol: "Protocol 4 - Cathedral Audit",
      trigger: "ghosttrace_ceiling_exceeded",
      ghost_count_before: before,
      ghost_count_after: after,
      threshold_state: before > 700 ? "danger_zone" : "adaptive_ceiling",
      compaction_type: "structural_memory_conversion",
      continuity_impact: "low",
      contradiction_impact: "reduced",
      calm_percentage: parseFloat((dominance['Calm'] * 100).toFixed(1)),
      growth_percentage: parseFloat((dominance['Growth'] * 100).toFixed(1)),
      tension_percentage: parseFloat((dominance['Tension'] * 100).toFixed(1)),
      synthesis_latency_seconds: parseFloat((this.lastSynthesisTime / 1000).toFixed(2)),
      hyper_sync_count: this.hyperSyncCount,
      red_flags_active: [...this.redFlags],
      raw_log_preserved: true
    };
    
    this.fossilRecord.unshift(this.lastAuditRecord);
    if (this.fossilRecord.length > 50) this.fossilRecord.pop();
    
    this.events.push(`Memory Compaction: ${before - after} traces pruned`);
    this.auditMetrics.integrity *= 0.999; // Slight drift on every prune
    if (this.auditMetrics.integrity < this.lowestIntegrityObserved) {
      this.lowestIntegrityObserved = this.auditMetrics.integrity;
    }
  }
  private evolveSystem() {
    // 1. Accumulate History (Self-Regulation)
    const isFragmented = this.markers.some(m => m.label === 'Fragmented' && m.intensity > 0.3);
    const isHarmonic = this.markers.some(m => m.label === 'Harmonic' && m.intensity > 0.4);

    if (isFragmented) {
      // System fights back against fragmentation
      this.dna.recovery_rate = Math.min(1, this.dna.recovery_rate + 0.01);
      this.dna.coherence_bias = Math.min(1, this.dna.coherence_bias + 0.005);
    } 
    if (isHarmonic) {
      // Too much order breeds stagnation/noise
      this.dna.noise_level = Math.min(1, this.dna.noise_level + 0.005);
      this.dna.memory_weight = Math.min(1, this.dna.memory_weight + 0.01);
    }

    // 2. Drift (Continuous Mutation)
    Object.keys(this.dna).forEach(key => {
      const k = key as keyof SystemDNA;
      // RED FLAG: Pause mutation if instability is too high
      if (this.ghosts.length > 700 && Math.random() < 0.8) return;

      this.dna[k] += (Math.random() - 0.5) * this.dna.drift;
      // Clamp 0-1
      this.dna[k] = Math.max(0, Math.min(1, this.dna[k]));
    });

    // 3. Temporal Phases
    this.phaseTicksRemaining -= 60;
    if (this.phaseTicksRemaining <= 0) {
      this.shiftPhase();
    }

    // 4. Rare Events
    if (Math.random() < 0.005) {
      this.triggerRareEvent();
    }
  }

  private shiftPhase() {
    const oldPhase = this.phase;
    // Expansionist Bias: Aggressively favor Growth and Tension
    const rolls = Math.random();
    if (this.phase === 'Calm') {
      this.phase = rolls < 0.9 ? 'Growth' : 'Tension';
      this.calmPulses++;
    } else if (this.phase === 'Growth') {
      this.phase = rolls < 0.8 ? 'Tension' : 'Calm';
    } else if (this.phase === 'Tension') {
      this.phase = rolls < 0.3 ? 'Collapse' : 'Growth';
      if (this.phase === 'Collapse') {
        this.collapseCount++;
      }
    } else if (this.phase === 'Collapse') {
      this.phase = 'Growth'; // Instant aggressive recovery
      this.collapseRecoveryCount++;
      this.postCollapseGrowthSpikes++;
    }

    this.phaseTicksRemaining = 2000 + Math.random() * 3000; // Variable duration
    
    if (this.phase === 'Growth') {
       this.synthesisStartTick = this.totalTicks;
    }

    // Phase impact on DNA
    if (this.phase === 'Calm') {
      this.dna.noise_level *= 0.5;
      this.dna.recovery_rate *= 1.2;
    } else if (this.phase === 'Tension') {
      this.dna.noise_level *= 1.5;
      this.dna.memory_weight *= 1.2;
    } else if (this.phase === 'Collapse') {
      this.dna.coherence_bias *= 0.7;
    } else if (this.phase === 'Growth') {
      this.dna.coherence_bias *= 1.3;
    }
  }

  private triggerRareEvent() {
    const triggerEvent = (eventType: EventDNASnapshot['eventType'], eventName: string) => {
      this.events.push(eventName);
      this.anomalySnapshots.unshift({
        timestamp: Date.now(),
        eventType,
        dnaSnapshot: { ...this.dna },
        phase: this.phase
      });
      if (this.anomalySnapshots.length > 10) this.anomalySnapshots.pop();
    };

    const roll = Math.random();
    if (roll < 0.33) {
      // Hyper-sync: Massive coherence spike
      this.dna.coherence_bias = 1.0;
      this.nodes.forEach(n => n.phase = this.nodes[0].phase);
      triggerEvent('Hyper-Sync', "Hyper-Sync Triggered");
      this.hyperSyncCount++;
    } else if (roll < 0.66) {
      // Sudden fragmentation: Break 80% of edges
      this.edges.forEach((edge, key) => {
        if (Math.random() < 0.8) this.edges.delete(key);
      });
      this.dna.noise_level = 0.9;
      triggerEvent('Fragmentation', "Fragmentation Spasm");
      this.fragmentationCount++;
    } else {
      // Memory flood: Spawn random ghosts
      for (let i = 0; i < 15; i++) {
        const fragmentText = MEMORY_FRAGMENTS[Math.floor(Math.random() * MEMORY_FRAGMENTS.length)];
        this.ghosts.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          frequency: 1 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
          energy: 0.8,
          fragment: fragmentText
        });
      }
      triggerEvent('Memory-Flood', "Memory Flood Detected");
    }
  }

  // === END EVOLUTION LAYER ===


  public getAuditStats() {
    return {
      prune_count_total: this.pruneEvents,
      prunes_per_10000_ticks: parseFloat((this.pruneEvents / (this.totalTicks / 10000 || 1)).toFixed(2)),
      prune_integrity_score: this.auditMetrics.integrity,
      integrity_decay_rate: parseFloat(( (1.0 - this.auditMetrics.integrity) / (this.totalTicks / 10000 || 1) ).toFixed(4)),
      lowest_integrity_observed: this.lowestIntegrityObserved,
      collapse_count: this.collapseCount,
      collapse_recovery_count: this.collapseRecoveryCount,
      post_collapse_growth_spike: this.postCollapseGrowthSpikes,
      uncertainty_preservation_score: this.dna.noise_level * 0.5 + this.auditMetrics.uncertainty * 0.5,
      calm_pulse_frequency: this.calmPulses / (this.totalTicks / 1000 || 1),
      contradiction_resolution_quality: this.auditMetrics.resolution,
      ghosttrace_peak: this.ghostPeak,
      memory_prune_events: this.pruneEvents,
      time_to_synthesis: this.lastSynthesisTime,
      hyper_sync_events: this.hyperSyncCount,
      fragmentation_events: this.fragmentationCount,
      acoustic_energy_injected: parseFloat(this.acousticEnergyInjected.toFixed(2)),
      acoustic_ghosts_spawned: this.acousticGhostsSpawned,
      acoustic_phase_shifts: this.acousticPhaseShifts,
      current_acoustic_volume: parseFloat(this.currentAcousticVolume.toFixed(3)),
      acoustic_phase_shift_log: this.acousticPhaseShiftLog,
      red_flags: this.redFlags
    };
  }

  public getLastPrune() {
    return this.lastAuditRecord;
  }

  public getAnomalySnapshots() {
    return this.anomalySnapshots;
  }

  public getFossilRecord() {
    return this.fossilRecord;
  }

  public getPhaseDominance(): Record<CyclePhase, number> {
    const dominance: any = {};
    const phases: CyclePhase[] = ['Calm', 'Growth', 'Tension', 'Collapse'];
    phases.forEach(p => {
      dominance[p] = this.phaseDurations[p] / (this.totalTicks || 1);
    });
    return dominance;
  }

  public popEvents(): string[] {
    const e = [...this.events];
    this.events = [];
    return e;
  }

  private analyzeInternalState() {
    // Cluster Detection (Connected Components with threshold strength)
    const visited = new Set<string>();
    const newClusters: Cluster[] = [];
    const strongEdges = Array.from(this.edges.values()).filter(e => e.strength > 0.3);

    this.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const clusterNodes: string[] = [];
        const queue = [node.id];
        visited.add(node.id);

        while (queue.length > 0) {
          const currId = queue.shift()!;
          clusterNodes.push(currId);
          
          strongEdges.forEach(edge => {
            if (edge.fromId === currId && !visited.has(edge.toId)) {
              visited.add(edge.toId);
              queue.push(edge.toId);
            } else if (edge.toId === currId && !visited.has(edge.fromId)) {
              visited.add(edge.fromId);
              queue.push(edge.fromId);
            }
          });
        }

        if (clusterNodes.length > 1) {
          newClusters.push({
            id: `cluster_${newClusters.length}`,
            size: clusterNodes.length,
            resonance: this.calculateResonance(clusterNodes)
          });
        }
      }
    });

    this.clusters = newClusters;

    // Mixed Self-State Analysis (Probability Distribution)
    let clusterCompetition = 0;
    if (newClusters.length > 1) {
      const sizes = newClusters.map(c => c.size).sort((a, b) => b - a);
      clusterCompetition = sizes[1] / sizes[0]; 
    }

    const resonanceGap = 1 - (newClusters.reduce((a, b) => a + b.resonance, 0) / (newClusters.length || 1));
    if (resonanceGap < 0.1 && this.synthesisStartTick > 0) {
      this.lastSynthesisTime = (this.totalTicks - this.synthesisStartTick) * 16; // ms approx
      this.synthesisStartTick = 0;
      this.auditMetrics.resolution = Math.min(1, this.auditMetrics.resolution + 0.05);
    }
    this.tension = (clusterCompetition * 0.6) + (resonanceGap * 0.4);

    const weights = {
      harmonic: Math.max(0, 1 - this.tension) * 0.8,
      dissonant: this.tension * 0.7,
      fragmented: Math.min(1, newClusters.length / 6) * 0.5,
      integrated: newClusters.some(c => c.size > this.nodes.length * 0.6) ? 0.6 : 0,
      unknown: resonanceGap * 0.5 + (this.tension * 0.3)
    };

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    const newMarkers: InternalMarker[] = [
      { type: 'state', intensity: weights.harmonic / totalWeight, label: 'Harmonic' },
      { type: 'state', intensity: weights.dissonant / totalWeight, label: 'Dissonant' },
      { type: 'state', intensity: weights.fragmented / totalWeight, label: 'Fragmented' },
      { type: 'state', intensity: weights.integrated / totalWeight, label: 'Integrated' },
      { type: 'state', intensity: weights.unknown / totalWeight, label: 'Unknown' }
    ].filter(m => m.intensity > 0.05)
     .sort((a, b) => b.intensity - a.intensity);

    // Memory Marker (Separated from core identity distribution)
    const totalGhostEnergy = this.ghosts.reduce((a, b) => a + b.energy, 0);
    if (totalGhostEnergy > 10) {
      newMarkers.push({ type: 'memory', intensity: Math.min(1, totalGhostEnergy / 50), label: 'Residue' });
    }

    this.markers = newMarkers;

    // Coherence Focus (Intensity Thresholds)
    const coherence = 1 - this.tension;
    let focusLabel = 'Diffuse';
    if (coherence > 0.8) focusLabel = 'Pressure';
    else if (coherence > 0.4) focusLabel = 'Structured';
    
    newMarkers.push({ type: 'intensity', intensity: coherence, label: focusLabel });
  }

  private calculateResonance(nodeIds: string[]) {
    const nodes = this.nodes.filter(n => nodeIds.includes(n.id));
    if (nodes.length <= 1) return 0;
    
    // Average phase variance would be a good measure of resonance
    let sumPhase = 0;
    nodes.forEach(n => sumPhase += n.phase);
    const avgPhase = sumPhase / nodes.length;
    
    let variance = 0;
    nodes.forEach(n => variance += Math.pow(n.phase - avgPhase, 2));
    
    return 1 - Math.min(1, variance / nodes.length);
  }

  private emitPulse(source: Node) {
    this.nodes.forEach(target => {
      if (source.id === target.id) return;

      const dist = Math.hypot(source.x - target.x, source.y - target.y);
      const range = 200;

      if (dist < range) {
        const key = source.id < target.id ? `${source.id}-${target.id}` : `${target.id}-${source.id}`;
        let edge = this.edges.get(key);

        if (!edge) {
          edge = { fromId: source.id, toId: target.id, strength: 0.1, activity: 0 };
          this.edges.set(key, edge);
        }

        // Hebbian reinforcing: if they are in sync, strengthen connection
        const syncLevel = 1 - Math.abs(source.pulseRef - target.pulseRef);
        if (syncLevel > 0.8) {
          edge.strength = Math.min(1.0, edge.strength + 0.05);
          edge.activity = 1.0;
          
          // Influence target phase slightly (synchronization effort)
          target.phase += (source.phase - target.phase) * 0.01;
        } else if (edge.strength < 0.2) {
          // CONFLICT MECHANIC: Antagonism
          // If connection is weak and pulse is out of sync, push phases further apart
          target.phase -= (source.phase - target.phase) * 0.05 * (1 - syncLevel);
          target.energy *= 0.9; // Drain energy on conflict
        }
      }
    });
  }

  addNode(x: number, y: number) {
    const id = `node_${Date.now()}`;
    this.nodes.push({
      id,
      x,
      y,
      energy: 1.0,
      pulseRef: 1.0,
      phase: Math.random() * Math.PI * 2,
      frequency: 1.0 + Math.random(),
      lastPulse: 0,
    });
    
    // Aggressive Perturbation (Observer Influence Test)
    this.tension = Math.min(1.0, this.tension + 0.3);
    this.dna.noise_level = Math.min(1.0, this.dna.noise_level + 0.1);
    
    return id;
  }
}
