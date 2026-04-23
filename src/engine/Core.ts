/**
 * Neural Engine: A simple simulation of emergent patterns.
 */

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

  constructor(width: number, height: number, nodeCount: number = 40) {
    this.width = width;
    this.height = height;
    this.init(nodeCount);
  }

  private init(count: number) {
    for (let i = 0; i < count; i++) {
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

  update(dt: number, time: number) {
    // Memory Decay: Ghosts fade slowly
    this.ghosts = this.ghosts.filter(g => {
      g.energy *= 0.9992;
      return g.energy > 0.05;
    });

    // Update nodes
    this.nodes.forEach(node => {
      // Natural oscillation
      node.pulseRef = Math.sin(time * node.frequency + node.phase);
      
      // Decay activity
      node.energy *= 0.95;

      // MEMORY BIAS: Sense nearby ghosts and pull phase/frequency towards them
      this.ghosts.forEach(ghost => {
        const d = Math.hypot(node.x - ghost.x, node.y - ghost.y);
        if (d < 120) {
          const influence = (1 - d / 120) * ghost.energy * dt * 0.15;
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
        if (Math.random() < 0.05) {
          this.ghosts.push({
            x: node.x,
            y: node.y,
            frequency: node.frequency,
            phase: node.phase,
            energy: 0.4
          });
        }
      }

      // TENSION FORCE: High tension creates phase noise
      if (this.tension > 0.5) {
        node.phase += (Math.random() - 0.5) * dt * this.tension;
      }
    });

    // Update edges
    this.edges.forEach((edge, key) => {
      edge.activity *= 0.9;
      
      // DYNAMIC GROWTH/DECAY FIGHT
      // High tension results in faster edge decay
      const decayBase = 0.9995;
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
    return id;
  }
}
