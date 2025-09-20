import { create } from "zustand";

type StaminaState = {
  pips: number;
  maxPips: number;
  regenDelay: number; // seconds per pip
  timer: number;
  busy: boolean;
  // actions
  spend: (n?: number) => void;
  give: (n?: number) => void;
  setMax: (n: number) => void;
  setDelay: (s: number) => void;
  setBusy: (b: boolean) => void;
  tick: (dt: number) => void;
};

export const useStamina = create<StaminaState>((set, get) => ({
  pips: 5,
  maxPips: 5,
  regenDelay: 0.6,
  timer: 0,
  busy: false,

  spend: (n = 1) => set((s) => ({ pips: Math.max(0, Math.min(s.maxPips, s.pips - n)) })),
  give: (n = 1) => set((s) => ({ pips: Math.max(0, Math.min(s.maxPips, s.pips + n)) })),
  setMax: (n) => set((s) => ({ maxPips: Math.max(0, Math.floor(n)), pips: Math.min(s.pips, Math.floor(n)) })),
  setDelay: (sec) => set({ regenDelay: Math.max(0.01, sec) }),
  setBusy: (b) => set({ busy: !!b }),

  tick: (dt) => {
    const { pips, maxPips, regenDelay, busy, timer } = get();
    if (pips >= maxPips) {
      if (timer !== 0) set({ timer: 0 });
      return;
    }
    if (busy) {
      // bleed timer down so it doesn't insta-pop on release
      const t = Math.max(0, timer - dt * 0.5);
      if (t !== timer) set({ timer: t });
      return;
    }
    let t = timer + dt;
    if (t >= regenDelay) {
      const gained = Math.floor(t / regenDelay);
      const newPips = Math.min(maxPips, pips + gained);
      t = t - gained * regenDelay;
      set({ pips: newPips, timer: t });
    } else {
      set({ timer: t });
    }
  },
}));

// Optional: expose in window for quick manual testing in DevTools
// @ts-ignore
if (typeof window !== "undefined") window.Stamina = { get: useStamina.getState, set: useStamina.setState };
