// client/src/lib/stores/useCombat.ts
import { create } from "zustand";
import { usePlayer } from "./usePlayer";
import { useGenocide } from "./useGenocide";

export type CombatPhase = "overworld" | "entering_combat" | "in_combat" | "exiting_combat";
export type CombatSubPhase = "normal" | "timing" | "defending";

export interface Enemy {
  id: string;
  position: { x: number; y: number; z: number };
  health: number;
  maxHealth: number;
  type: "basic" | "strong";
}

interface CombatState {
  // Phase state
  combatPhase: CombatPhase;
  combatSubPhase: CombatSubPhase;
  currentEnemy: Enemy | null;

  // Player attack system
  isPlayerAttacking: boolean;
  attackTimer: number;       // seconds remaining in current attack
  attackCooldown: number;    // seconds remaining before next attack
  playerAttackRange: number; // world units
  playerAttackDamage: number;

  // Punch-Out style timing window (adjusted by corruption)
  timingWindow: number;  // base window in seconds
  perfectTiming: boolean;

  // Phase transition actions
  initiateCombat: (enemy: Enemy) => void;
  exitCombat: (victory: boolean) => void;

  // Combat actions
  startAttack: () => void;
  endAttack: () => void;
  updateAttackTimer: (delta: number) => void;
  startDefend: () => void;
  endDefend: () => void;     // renamed from stopDefend
  checkAttackTiming: (inputTime: number) => boolean;

  // Corruption helpers
  adjustTimingWindowForCorruption: () => void;
  getCorruptionAdjustedWindow: () => number;
}

export const useCombat = create<CombatState>((set, get) => ({
  // === Defaults ===
  combatPhase: "overworld",
  combatSubPhase: "normal",
  currentEnemy: null,

  isPlayerAttacking: false,
  attackTimer: 0,
  attackCooldown: 0,
  playerAttackRange: 2.5,
  playerAttackDamage: 12,

  timingWindow: 0.3, // 300ms base window
  perfectTiming: false,

  // === Phase transitions ===
  initiateCombat: (enemy) => {
    console.log(`Initiating combat with enemy ${enemy.id}`);
    set({
      combatPhase: "entering_combat",
      currentEnemy: enemy,
      combatSubPhase: "normal",
    });

    setTimeout(() => {
      if (get().combatPhase === "entering_combat") {
        set({ combatPhase: "in_combat" });
        console.log("Entered combat mode");
      }
    }, 700);
  },

  exitCombat: (victory) => {
    console.log(`Exiting combat, victory: ${victory}`);
    set({
      combatPhase: "exiting_combat",
      combatSubPhase: "normal",
    });

    setTimeout(() => {
      if (!victory) {
        const { resetPlayer } = usePlayer.getState();
        resetPlayer();
        console.log("Player health reset after defeat");
      }

      set({
        combatPhase: "overworld",
        currentEnemy: null,
        isPlayerAttacking: false,
        attackTimer: 0,
        attackCooldown: 0,
        perfectTiming: false,
      });
      console.log("Returned to overworld");
    }, 1200);
  },

  // === Player actions ===
  startAttack: () => {
    const { combatPhase, attackCooldown } = get();
    if (combatPhase !== "in_combat") return;
    if (attackCooldown > 0) {
      console.log("⏱️ Attack on cooldown");
      return;
    }
    console.log("🗡️ Player executes skillful attack!");
    set({
      isPlayerAttacking: true,
      attackTimer: 0.4,  // active attack window (400ms)
      attackCooldown: 0.8,
      combatSubPhase: "timing",
    });
  },

  endAttack: () => {
    set({
      isPlayerAttacking: false,
      attackTimer: 0,
      combatSubPhase: "normal",
      perfectTiming: false,
    });
  },

  updateAttackTimer: (delta) => {
    const { isPlayerAttacking, attackTimer, attackCooldown } = get();

    // tick active attack
    if (isPlayerAttacking) {
      const newTimer = Math.max(0, attackTimer - delta);
      set({ attackTimer: newTimer });
      if (newTimer === 0) {
        const { endAttack } = get();
        endAttack();
      }
    }

    // tick cooldown
    if (attackCooldown > 0) {
      const newCooldown = Math.max(0, attackCooldown - delta);
      set({ attackCooldown: newCooldown });
    }
  },

  startDefend: () => {
    const { combatPhase } = get();
    if (combatPhase !== "in_combat") return;
    set({ combatSubPhase: "defending" });
  },

  endDefend: () => {
    const { combatPhase } = get();
    if (combatPhase !== "in_combat") return;
    set({ combatSubPhase: "normal" });
  },

  // Called when player presses the timing key; returns true if within window
  checkAttackTiming: (inputTime: number) => {
    const window = get().getCorruptionAdjustedWindow();
    const ok = Math.abs(inputTime) <= window / 2;
    if (ok) set({ perfectTiming: true });
    return ok;
  },

  // === Corruption helpers ===
  adjustTimingWindowForCorruption: () => {
    const { corruption } = useGenocide.getState();
    const base = 0.3;
    const penalty = 0.05 * corruption;
    const minWindow = 0.1;
    const adjusted = Math.max(minWindow, base - penalty);
    set({ timingWindow: adjusted });
    console.log(`Timing window adjusted due to corruption: ${adjusted.toFixed(3)}s`);
  },

  getCorruptionAdjustedWindow: () => {
    const { corruption } = useGenocide.getState();
    const base = 0.3;
    const penalty = 0.05 * corruption;
    const minWindow = 0.1;
    return Math.max(minWindow, base - penalty);
  },
}));
