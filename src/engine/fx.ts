import type { Settings } from '../store/state';

let ctx: AudioContext | null = null;

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.12) {
  if (!ctx) ctx = new AudioContext();
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// Petites percussions synthétisées en attendant les sons définitifs (percussions, kora).
export const sfx = {
  tap(s: Settings) {
    if (s.sound) tone(660, 0, 0.06, 'triangle', 0.06);
  },
  good(s: Settings) {
    if (s.sound) {
      tone(523, 0, 0.12, 'triangle');
      tone(784, 0.09, 0.22, 'triangle');
    }
    if (s.vibration) navigator.vibrate?.(30);
  },
  bad(s: Settings) {
    if (s.sound) {
      tone(220, 0, 0.18, 'sawtooth', 0.05);
      tone(165, 0.12, 0.24, 'sawtooth', 0.05);
    }
    if (s.vibration) navigator.vibrate?.([40, 50, 40]);
  },
  win(s: Settings) {
    if (!s.sound) return;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle', 0.1));
  },
  tick(s: Settings) {
    if (s.sound) tone(1200, 0, 0.03, 'square', 0.03);
  },
};

// Synthèse vocale de dépannage : en production, voix humaine enregistrée (section 3.5).
export function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR';
  u.rate = 0.92;
  const fr = speechSynthesis.getVoices().find((v) => v.lang.startsWith('fr'));
  if (fr) u.voice = fr;
  speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
