export const AudioEngine = {
  ctx: null as AudioContext | null,
  masterGain: null as GainNode | null,
  synthOsc: null as OscillatorNode | null,
  synthGain: null as GainNode | null,
  droneOsc: null as OscillatorNode | null,
  subDroneOsc: null as OscillatorNode | null,
  harmonicDroneOsc: null as OscillatorNode | null,
  droneFilter: null as BiquadFilterNode | null,
  droneGain: null as GainNode | null,
  subDroneGain: null as GainNode | null,
  harmonicDroneGain: null as GainNode | null,
  tensionLfo: null as OscillatorNode | null,

  isInitialized: false,
  wakefulnessEnabled: true,
  wakefulnessLevel: 0, // 0 to 1 density index

  init() {
    if (this.isInitialized) return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5; // Main volume
    this.masterGain.connect(this.ctx.destination);

    // Shared Lowpass Drone Filter for Density Modulation
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.value = 80; // Starts dark & low
    this.droneFilter.Q.value = 2.0;

    // Base Drone (Low A - 55 Hz)
    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.value = 55;
    
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0;
    this.droneOsc.connect(this.droneGain);
    this.droneGain.connect(this.droneFilter);

    // Sub-Bass Drone for Neural Wakefulness Density (Low A0 - 27.5 Hz)
    this.subDroneOsc = this.ctx.createOscillator();
    this.subDroneOsc.type = 'triangle';
    this.subDroneOsc.frequency.value = 27.5;

    this.subDroneGain = this.ctx.createGain();
    this.subDroneGain.gain.value = 0;
    this.subDroneOsc.connect(this.subDroneGain);
    this.subDroneOsc.connect(this.droneFilter);

    // Harmonic Drone for Neural Activity Overtone Density (82.5 Hz Fifth)
    this.harmonicDroneOsc = this.ctx.createOscillator();
    this.harmonicDroneOsc.type = 'sine';
    this.harmonicDroneOsc.frequency.value = 82.5;

    this.harmonicDroneGain = this.ctx.createGain();
    this.harmonicDroneGain.gain.value = 0;
    this.harmonicDroneOsc.connect(this.harmonicDroneGain);
    this.harmonicDroneOsc.connect(this.droneFilter);

    this.droneFilter.connect(this.masterGain);

    this.droneOsc.start();
    this.subDroneOsc.start();
    this.harmonicDroneOsc.start();

    // Synth (Growth/Tension)
    this.synthOsc = this.ctx.createOscillator();
    this.synthOsc.type = 'triangle';
    this.synthOsc.frequency.value = 220; // A3
    this.synthGain = this.ctx.createGain();
    this.synthGain.gain.value = 0;
    
    // LFO for tension distortion/wobble
    this.tensionLfo = this.ctx.createOscillator();
    this.tensionLfo.type = 'sawtooth';
    this.tensionLfo.frequency.value = 0.1;
    
    // Create a filter for the synth
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    this.tensionLfo.connect(filter.frequency);
    this.tensionLfo.start();

    this.synthOsc.connect(filter);
    filter.connect(this.synthGain);
    this.synthGain.connect(this.masterGain);
    this.synthOsc.start();

    this.isInitialized = true;
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  setWakefulness(enabled: boolean) {
    this.wakefulnessEnabled = enabled;
  },

  update(phase: string, dominance: Record<string, number>, avgTimeToActivation: number = 0) {
    if (!this.isInitialized || !this.ctx) return;
    
    const now = this.ctx.currentTime;

    // Wakefulness calculation: as avgTimeToActivation decreases, wakefulness / drone density increases
    let rawWakefulness = 0.2;
    if (avgTimeToActivation > 0) {
      // Lower avg_time_to_activation (e.g. 5 to 50 ticks) = fast neural response = high wakefulness
      rawWakefulness = Math.max(0, Math.min(1, 1 - (avgTimeToActivation - 10) / 180));
    } else {
      rawWakefulness = 0.35; // Default active baseline
    }

    this.wakefulnessLevel = this.wakefulnessEnabled ? rawWakefulness : 0;

    // Base drone follows Calm dominance + Wakefulness density boost
    const calmLevel = dominance['Calm'] || 0;
    const droneVol = calmLevel * (0.3 + this.wakefulnessLevel * 0.35);
    this.droneGain?.gain.setTargetAtTime(droneVol, now, 0.8);
    
    // Low frequency sub-drone gain scales directly with wakefulness level
    const subVol = this.wakefulnessEnabled ? (0.05 + this.wakefulnessLevel * 0.35) : 0;
    this.subDroneGain?.gain.setTargetAtTime(subVol, now, 0.8);

    // Harmonic drone overtone gain scales with wakefulness density
    const harmonicVol = this.wakefulnessEnabled ? (this.wakefulnessLevel * 0.25) : 0;
    this.harmonicDroneGain?.gain.setTargetAtTime(harmonicVol, now, 0.8);

    // Open drone filter cutoff frequency as wakefulness increases (denser, richer low-end)
    const filterCutoff = 60 + this.wakefulnessLevel * 240; // 60Hz -> 300Hz
    this.droneFilter?.frequency.setTargetAtTime(filterCutoff, now, 1.2);

    // Pitch drone down slightly during Collapse
    if (phase === 'Collapse') {
        this.droneOsc?.frequency.setTargetAtTime(45, now, 0.5);
        this.subDroneOsc?.frequency.setTargetAtTime(22.5, now, 0.5);
    } else {
        this.droneOsc?.frequency.setTargetAtTime(55, now, 2.0);
        this.subDroneOsc?.frequency.setTargetAtTime(27.5, now, 2.0);
    }

    // Synth follows Growth and Tension
    const growthLevel = dominance['Growth'] || 0;
    const tensionLevel = dominance['Tension'] || 0;
    const collapseLevel = dominance['Collapse'] || 0;

    const synthVolume = (growthLevel * 0.2) + (tensionLevel * 0.3) + (collapseLevel * 0.4);
    this.synthGain?.gain.setTargetAtTime(synthVolume, now, 0.5);

    if (phase === 'Calm') {
        this.synthOsc?.frequency.setTargetAtTime(110, now, 2.0); // A2
        this.tensionLfo?.frequency.setTargetAtTime(0.1, now, 1.0);
        this.synthOsc!.type = 'sine';
    } else if (phase === 'Growth') {
        this.synthOsc?.frequency.setTargetAtTime(329.63, now, 0.5); // E4
        this.tensionLfo?.frequency.setTargetAtTime(2.0, now, 1.0);
        this.synthOsc!.type = 'triangle';
    } else if (phase === 'Tension') {
        this.synthOsc?.frequency.setTargetAtTime(233.08, now, 0.1); // Bb3
        this.tensionLfo?.frequency.setTargetAtTime(8.0, now, 0.2); // Fast wobble
        this.synthOsc!.type = 'square';
    } else if (phase === 'Collapse') {
        this.synthOsc?.frequency.setTargetAtTime(55, now, 0.1);
        this.tensionLfo?.frequency.setTargetAtTime(20.0, now, 0.1);
        this.synthOsc!.type = 'sawtooth';
    }
  },

  triggerSnap() {
    if (!this.isInitialized || !this.ctx || !this.masterGain) return;

    // Digital 'snap' for pruning
    const now = this.ctx.currentTime;
    
    const snapOsc = this.ctx.createOscillator();
    snapOsc.type = 'square';
    
    const snapGain = this.ctx.createGain();
    
    // Envelope: Sharp attack, quick decay
    snapGain.gain.setValueAtTime(0, now);
    snapGain.gain.linearRampToValueAtTime(0.3, now + 0.01);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    // Pitch drop
    snapOsc.frequency.setValueAtTime(800, now);
    snapOsc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

    snapOsc.connect(snapGain);
    snapGain.connect(this.masterGain);
    
    snapOsc.start(now);
    snapOsc.stop(now + 0.15);
    
    console.log(`[AudioEngine] Pruning Snap triggered!`);
  }
};
