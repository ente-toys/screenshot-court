"use client";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

/** Gavel bang — sharp percussive hit */
export function playGavelBang() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  // Impact noise burst
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  // Low thud oscillator
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

  // Gains
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(1.0, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.8, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  // Filter for the noise
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2000, now);
  filter.frequency.exponentialRampToValueAtTime(200, now + 0.1);

  noise.connect(filter).connect(noiseGain).connect(ctx.destination);
  osc.connect(oscGain).connect(ctx.destination);

  noise.start(now);
  osc.start(now);
  osc.stop(now + 0.15);
}

/** Triple gavel bang — order in the court */
export function playTripleBang() {
  playGavelBang();
  setTimeout(() => playGavelBang(), 200);
  setTimeout(() => playGavelBang(), 400);
}

/** Dramatic reveal — rising tone for verdict */
export function playDramaticReveal() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.4);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
  gain.gain.setValueAtTime(0.3, now + 0.4);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.8);
}

/** Guilty buzzer — low ominous tone */
export function playGuiltyBuzz() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc1 = ctx.createOscillator();
  osc1.type = "sawtooth";
  osc1.frequency.setValueAtTime(90, now);

  const osc2 = ctx.createOscillator();
  osc2.type = "sawtooth";
  osc2.frequency.setValueAtTime(93, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.setValueAtTime(0.15, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(400, now);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain).connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.6);
  osc2.stop(now + 0.6);
}

/** Not guilty chime — bright positive ding */
export function playAcquittalChime() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  [523, 659, 784].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    const gain = ctx.createGain();
    const t = now + i * 0.12;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  });
}
