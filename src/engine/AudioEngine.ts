export const AudioEngine = {
  ctx: null as AudioContext | null,
  masterGain: null as GainNode | null,
  synthOsc: null as OscillatorNode | null,
  synthGain: null as GainNode | null,
  droneOsc: null as OscillatorNode | null,
  droneGain: null as GainNode | null,
  tensionLfo: null as OscillatorNode | null,

  isInitialized: false,

  init() {
    if (this.isInitialized) return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.5; // Main volume
    this.masterGain.connect(this.ctx.destination);

    // Drone (Calm/Base)
    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.value = 55; // Low A
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0;
    this.droneOsc.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);
    this.droneOsc.start();

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

  update(phase: string, dominance: Record<string, number>) {
    if (!this.isInitialized || !this.ctx) return;
    
    const now = this.ctx.currentTime;

    // Base drone follows Calm dominance
    const calmLevel = dominance['Calm'] || 0;
    this.droneGain?.gain.setTargetAtTime(calmLevel * 0.4, now, 1.0);
    
    // Pitch drone down slightly during Collapse
    if (phase === 'Collapse') {
        this.droneOsc?.frequency.setTargetAtTime(45, now, 0.5);
    } else {
        this.droneOsc?.frequency.setTargetAtTime(55, now, 2.0);
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
        console.log(`[AudioEngine] Phase: ${phase} | Drone: ${calmLevel.toFixed(2)} | Synth Vol: ${synthVolume.toFixed(2)} | Timbre: sine, slow lfo`);
    } else if (phase === 'Growth') {
        // Chime-like intervals
        this.synthOsc?.frequency.setTargetAtTime(329.63, now, 0.5); // E4
        this.tensionLfo?.frequency.setTargetAtTime(2.0, now, 1.0);
        this.synthOsc!.type = 'triangle';
        console.log(`[AudioEngine] Phase: ${phase} | Drone: ${calmLevel.toFixed(2)} | Synth Vol: ${synthVolume.toFixed(2)} | Timbre: triangle, mid lfo`);
    } else if (phase === 'Tension') {
        // Discordant
        this.synthOsc?.frequency.setTargetAtTime(233.08, now, 0.1); // Bb3
        this.tensionLfo?.frequency.setTargetAtTime(8.0, now, 0.2); // Fast wobble
        this.synthOsc!.type = 'square';
        console.log(`[AudioEngine] Phase: ${phase} | Drone: ${calmLevel.toFixed(2)} | Synth Vol: ${synthVolume.toFixed(2)} | Timbre: square, fast wobble`);
    } else if (phase === 'Collapse') {
        // Distorted drop
        this.synthOsc?.frequency.setTargetAtTime(55, now, 0.1);
        this.tensionLfo?.frequency.setTargetAtTime(20.0, now, 0.1);
        this.synthOsc!.type = 'sawtooth';
        console.log(`[AudioEngine] Phase: ${phase} | Drone: ${calmLevel.toFixed(2)} | Synth Vol: ${synthVolume.toFixed(2)} | Timbre: sawtooth, distort`);
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
