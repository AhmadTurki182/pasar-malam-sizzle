// Pasar Malam Sizzle — all sounds are synthesized with WebAudio.
// No audio files are loaded; every effect is a few oscillators or a short
// burst of filtered noise, so the game stays silent on disk and loud in play.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.noiseBuf = null;
  }

  // Browsers only allow audio after a user gesture; call this from the
  // first click or keypress and every effect after it just works.
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      const len = Math.floor(this.ctx.sampleRate * 0.5);
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    } catch {
      this.ctx = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, dur, type = 'sine', vol = 0.16, slideTo = null, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  noise(dur, vol = 0.2, freq = 3200, delay = 0) {
    if (!this.ctx || this.muted || !this.noiseBuf) return;
    const t0 = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 0.8;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  click() { this.tone(740, 0.07, 'square', 0.08); }
  pick() { this.tone(520, 0.08, 'triangle', 0.14, 780); }
  drop() { this.tone(300, 0.1, 'triangle', 0.12, 180); }
  // A coin cascade for a big tip: bright, quick, unmistakably happy.
  coins() {
    [1046, 1318, 1568].forEach((f, i) => this.tone(f, 0.1, 'sine', 0.12, null, i * 0.06));
  }
  sizzle() { this.noise(0.9, 0.16, 4200); this.tone(180, 0.5, 'sawtooth', 0.05, 90); }
  perfect() {
    this.tone(660, 0.12, 'sine', 0.16);
    this.tone(880, 0.12, 'sine', 0.16, null, 0.09);
    this.tone(1320, 0.22, 'sine', 0.16, null, 0.18);
  }
  serve() {
    this.tone(880, 0.1, 'sine', 0.16);
    this.tone(1174, 0.18, 'sine', 0.16, null, 0.08);
  }
  burnt() { this.tone(220, 0.35, 'sawtooth', 0.14, 110); this.noise(0.3, 0.1, 900); }
  angry() { this.tone(160, 0.3, 'square', 0.1, 90); }
  levelUp() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.14, 'triangle', 0.14, null, i * 0.09));
  }
  gameOver() {
    [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.13, null, i * 0.16));
  }
}
