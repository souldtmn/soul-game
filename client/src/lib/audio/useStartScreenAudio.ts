// client/src/lib/audio/useStartScreenAudio.ts
import { useCallback, useEffect, useRef } from "react";

/** --- Tunables (melancholic vibe) ------------------------------- */
const MASTER_TARGET = 0.10;       // overall loudness after arm() — slightly quieter
const TICK_VOL      = 0.45;
const TICK_FREQ     = 950;

const BUZZ_FREQ_HZ  = 95;         // ↓ lower pitch for somber feel
const BUZZ_LEVEL    = 0.16;       // ↓ softer buzz level
const VIB_RATE_HZ   = 1.2;        // ↓ slower vibrato (gentle drift)
const VIB_DEPTH_CT  = 1.2;        // ↓ shallower vibrato depth (subtle)
const BUZZ_FADE_S   = 2.0;        // ↑ slower fade-in for mood

const ZAP_START_HZ  = 3000;       // glitch zap start freq
const ZAP_END_HZ    = 120;        // glitch zap end freq
const ZAP_TIME_S    = 0.18;       // glide length
const ZAP_VOL       = 0.7;

const CRACKLE_TIME_S = 0.10;      // crackle duration
const CRACKLE_VOL    = 0.6;
/** --------------------------------------------------------------- */

export function useStartScreenAudio() {
  const ctxRef   = useRef<AudioContext | null>(null);
  const master   = useRef<GainNode | null>(null);

  // ambience refs
  const buzzOsc  = useRef<OscillatorNode | null>(null);
  const buzzGain = useRef<GainNode | null>(null);
  const vibOsc   = useRef<OscillatorNode | null>(null);
  const hpRef    = useRef<BiquadFilterNode | null>(null);
  const lpRef    = useRef<BiquadFilterNode | null>(null);

  const ensure = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const Ctx: any = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();

    const g = ctx.createGain();
    g.gain.value = 0.0;
    g.connect(ctx.destination);

    ctxRef.current = ctx;
    master.current = g;
    return ctx;
  }, []);

  /** Bring master up on first gesture so ticks are audible pre-glitch */
  const arm = useCallback(() => {
    const ctx = ensure(); if (!ctx || !master.current) return;
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    const mg = master.current.gain;
    mg.cancelScheduledValues(now);
    mg.setValueAtTime(mg.value, now);
    mg.linearRampToValueAtTime(MASTER_TARGET, now + 0.08);
  }, [ensure]);

  /** Ambient: arcade cabinet buzz */
  const startAmbience = useCallback(() => {
    const ctx = ensure(); if (!ctx || !master.current) return;
    if (buzzOsc.current) return; // already running

    // source
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = BUZZ_FREQ_HZ;

    // subtle vibrato (frequency modulation via detune in cents)
    const vib = ctx.createOscillator();
    vib.frequency.value = VIB_RATE_HZ;
    const vibGain = ctx.createGain();
    vibGain.gain.value = VIB_DEPTH_CT; // cents
    vib.connect(vibGain).connect(osc.detune);

    // tone shaping
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 80;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900; // darker/softer than 2000 for melancholic vibe

    // output gain
    const out = ctx.createGain();
    out.gain.value = 0.0;

    // wire
    osc.connect(hp).connect(lp).connect(out).connect(master.current);

    osc.start();
    vib.start();

    // fade in
    const now = ctx.currentTime;
    out.gain.cancelScheduledValues(now);
    out.gain.setValueAtTime(0, now);
    out.gain.linearRampToValueAtTime(BUZZ_LEVEL, now + BUZZ_FADE_S);

    // keep refs
    buzzOsc.current  = osc;
    buzzGain.current = out;
    vibOsc.current   = vib;
    hpRef.current    = hp;
    lpRef.current    = lp;
  }, [ensure]);

  const stopAmbience = useCallback(() => {
    const ctx = ctxRef.current; if (!ctx || !buzzOsc.current || !buzzGain.current) return;
    const now = ctx.currentTime;
    buzzGain.current.gain.linearRampToValueAtTime(0.0, now + 0.4);
    try { buzzOsc.current.stop(now + 0.45); } catch {}
    try { vibOsc.current?.stop(now + 0.45); } catch {}
    buzzOsc.current = null;
    vibOsc.current = null;
    buzzGain.current = null;
    hpRef.current = null;
    lpRef.current = null;
  }, []);

  /** Typewriter tick */
  const type = useCallback(() => {
    const ctx = ensure(); if (!ctx || !master.current) return;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = "square";
    osc.frequency.value = TICK_FREQ;

    osc.connect(env).connect(master.current);
    const now = ctx.currentTime;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(TICK_VOL, now + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.start(now);
    osc.stop(now + 0.16);
  }, [ensure]);

  /** Glitch combo: error ZAP + crackle burst */
  const glitch = useCallback(() => {
    const ctx = ensure(); if (!ctx || !master.current) return;
    const now = ctx.currentTime;

    // --- ZAP (square glide) ---
    const zapOsc = ctx.createOscillator();
    zapOsc.type = "square";
    zapOsc.frequency.setValueAtTime(ZAP_START_HZ, now);
    // exponential glides can’t hit zero; clamp to end freq
    zapOsc.frequency.exponentialRampToValueAtTime(Math.max(ZAP_END_HZ, 1), now + ZAP_TIME_S);

    const zapEnv = ctx.createGain();
    zapEnv.gain.value = 0.0;
    zapOsc.connect(zapEnv).connect(master.current);

    zapEnv.gain.setValueAtTime(0, now);
    zapEnv.gain.linearRampToValueAtTime(ZAP_VOL, now + 0.015);
    zapEnv.gain.exponentialRampToValueAtTime(0.0001, now + ZAP_TIME_S + 0.06);

    zapOsc.start(now);
    zapOsc.stop(now + ZAP_TIME_S + 0.08);

    // --- CRACKLE (noise + shaping) ---
    const dur = CRACKLE_TIME_S;
    const noiseBuf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
    const ch = noiseBuf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;

    const hp = ctx.createBiquadFilter();  // keep it crispy
    hp.type = "highpass"; hp.frequency.value = 800;

    const bp = ctx.createBiquadFilter();  // focus the sizzle
    bp.type = "bandpass"; bp.frequency.value = 2500; bp.Q.value = 1.2;

    // mild distortion waveshaper
    const ws = ctx.createWaveShaper();
    ws.curve = makeDistCurve(256, 2.2);

    const nEnv = ctx.createGain(); nEnv.gain.value = 0.0;

    noise.connect(hp).connect(bp).connect(ws).connect(nEnv).connect(master.current);

    nEnv.gain.setValueAtTime(0, now);
    nEnv.gain.linearRampToValueAtTime(CRACKLE_VOL, now + 0.008);
    nEnv.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    noise.start(now);
    noise.stop(now + dur + 0.02);
  }, [ensure]);

  useEffect(() => () => {
    try { stopAmbience(); ctxRef.current?.close(); } catch {}
  }, [stopAmbience]);

  return { arm, startAmbience, stopAmbience, type, glitch } as const;
}

/** Simple soft-clipping curve */
function makeDistCurve(samples: number, amount: number) {
  const curve = new Float32Array(samples);
  const k = typeof amount === "number" ? amount : 1;
  const deg = Math.PI / 180;
  for (let i = 0; i < samples; ++i) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}
