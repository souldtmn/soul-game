import { create } from "zustand";

interface CombatState {
  isPlayerAttacking: boolean;
  attackTimer: number;
  playerAttackRange: number;
  combatPhase: 'normal' | 'timing' | 'defending';
  
  // Punch-Out style timing mechanics
  timingWindow: number;
  perfectTiming: boolean;
  
  // Actions
  startAttack: () => void;
  endAttack: () => void;
  updateAttackTimer: (delta: number) => void;
  startDefend: () => void;
  endDefend: () => void;
  checkTiming: (inputTime: number) => boolean;
}

export const useCombat = create<CombatState>((set, get) => ({
  isPlayerAttacking: false,
  attackTimer: 0,
  playerAttackRange: 2.5,
  combatPhase: 'normal',
  timingWindow: 0.3, // 300ms window for perfect timing
  perfectTiming: false,
  
  startAttack: () => {
    set({
      isPlayerAttacking: true,
      attackTimer: 0.5, // Attack lasts 500ms
      combatPhase: 'timing'
    });
  },
  
  endAttack: () => {
    set({
      isPlayerAttacking: false,
      attackTimer: 0,
      combatPhase: 'normal',
      perfectTiming: false
    });
  },
  
  updateAttackTimer: (delta) => {
    const { attackTimer, isPlayerAttacking } = get();
    if (isPlayerAttacking && attackTimer > 0) {
      const newTimer = attackTimer - delta;
      set({ attackTimer: Math.max(0, newTimer) });
    }
  },
  
  startDefend: () => {
    set({ combatPhase: 'defending' });
  },
  
  endDefend: () => {
    set({ combatPhase: 'normal' });
  },
  
  checkTiming: (inputTime) => {
    // Simplified timing check for Punch-Out style mechanics
    const { timingWindow } = get();
    const perfect = Math.abs(inputTime % 1.0) < timingWindow;
    set({ perfectTiming: perfect });
    return perfect;
  },
}));
