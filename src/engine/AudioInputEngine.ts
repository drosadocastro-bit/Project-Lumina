// AudioInputEngine.ts
export class AudioInputEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private stream: MediaStream | null = null;
  public isListening: boolean = false;

  async startListening(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);
      
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      this.isListening = true;
      return true;
    } catch (err) {
      console.error("[AudioInputEngine] Error accessing microphone:", err);
      this.isListening = false;
      return false;
    }
  }

  stopListening() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.isListening = false;
    this.analyser = null;
    this.microphone = null;
    this.audioContext = null;
  }

  getAudioData(): { volume: number, frequencies: Uint8Array | null } {
    if (!this.isListening || !this.analyser || !this.dataArray) {
      return { volume: 0, frequencies: null };
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    
    let volume = sum / this.dataArray.length; // 0 to 255
    const normalizedVolume = volume / 255;
    
    // Apply a simple noise gate (ignore constant background hum)
    const finalVolume = normalizedVolume > 0.05 ? normalizedVolume : 0;
    
    return { volume: finalVolume, frequencies: this.dataArray }; // normalized 0-1
  }
}

export const AudioInput = new AudioInputEngine();
