import { create } from "zustand";

export type CombatPhase = 'overworld' | 'entering_combat' | 'in_combat' | 'exiting_combat';
export type CombatSubPhase = 'normal' | 'timing' | 'defending';

interface Enemy {
  id: string;
  position: { x: number; y: number; z: number };
  health: number;
  maxHealth: number;
  type: 'basic' | 'strong';
}

interface CombatState {
  // Core combat phase system
  combatPhase: CombatPhase;
  combatSubPhase: CombatSubPhase;
  currentEnemy: Enemy | null;
  
  // Player attack system
  isPlayerAttacking: boolean;
  attackTimer: number;
  playerAttackRange: number;
  
  // Punch-Out style timing mechanics
  timingWindow: number;
  perfectTiming: boolean;
  
  // Phase transition actions
  initiateCombat: (enemy: Enemy) => void;
  exitCombat: (victory: boolean) => void;
  
  // Combat actions
  startAttack: () => void;
  endAttack: () => void;
  updateAttackTimer: (delta: number) => void;
  startDefend: () => void;
  endDefend: () => void;
  checkTiming: (inputTime: number) => boolean;
}

export const useCombat = create<CombatState>((set, get) => ({
  // Combat phase state
  combatPhase: 'overworld',
  combatSubPhase: 'normal',
  currentEnemy: null,
  
  // Player attack system
  isPlayerAttacking: false,
  attackTimer: 0,
  playerAttackRange: 2.5,
  
  // Punch-Out style timing mechanics
  timingWindow: 0.3, // 300ms window for perfect timing
  perfectTiming: false,
  
  // Phase transition functions
  initiateCombat: (enemy: Enemy) => {
    console.log(`Initiating combat with enemy ${enemy.id}`);
    set({
      combatPhase: 'entering_combat',
      currentEnemy: enemy,
      combatSubPhase: 'normal'
    });
    
    // Transition to in_combat after a brief delay
    setTimeout(() => {
      set({ combatPhase: 'in_combat' });
      console.log('Entered combat mode');
    }, 1000);
  },
  
  exitCombat: (victory: boolean) => {
    console.log(`Exiting combat, victory: ${victory}`);
    set({
      combatPhase: 'exiting_combat',
      combatSubPhase: 'normal'
    });
    
    // Transition back to overworld after a brief delay
    setTimeout(() => {
      set({
        combatPhase: 'overworld',
        currentEnemy: null,
        isPlayerAttacking: false,
        attackTimer: 0,
        perfectTiming: false
      });
      console.log('Returned to overworld');
    }, 1500);
  },
  
  // Combat action functions
  startAttack: () => {
    const { combatPhase } = get();
    if (combatPhase === 'in_combat') {
      set({
        isPlayerAttacking: true,
        attackTimer: 0.5, // Attack lasts 500ms
        combatSubPhase: 'timing'
      });
    }
  },
  
  endAttack: () => {
    set({
      isPlayerAttacking: false,
      attackTimer: 0,
      combatSubPhase: 'normal',
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
    const { combatPhase } = get();
    if (combatPhase === 'in_combat') {
      set({ combatSubPhase: 'defending' });
    }
  },
  
  endDefend: () => {
    set({ combatSubPhase: 'normal' });
  },
  
  checkTiming: (inputTime) => {
    // Simplified timing check for Punch-Out style mechanics
    const { timingWindow } = get();
    const perfect = Math.abs(inputTime % 1.0) < timingWindow;
    set({ perfectTiming: perfect });
    return perfect;
  },
}));
