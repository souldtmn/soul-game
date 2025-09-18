import { create } from "zustand";
import { usePlayer } from "./usePlayer";

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
  attackCooldown: number;
  playerAttackRange: number;
  playerAttackDamage: number;
  
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
  attackCooldown: 0,
  playerAttackRange: 2.5,
  playerAttackDamage: 25,
  
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
      // Reset player health if defeated (not victory)
      if (!victory) {
        const { resetPlayer } = usePlayer.getState();
        resetPlayer();
        console.log('Player health reset after defeat');
      }
      
      set({
        combatPhase: 'overworld',
        currentEnemy: null,
        isPlayerAttacking: false,
        attackTimer: 0,
        attackCooldown: 0,
        perfectTiming: false
      });
      console.log('Returned to overworld');
    }, 1500);
  },
  
  // Combat action functions
  startAttack: () => {
    const { combatPhase, attackCooldown } = get();
    if (combatPhase === 'in_combat' && attackCooldown <= 0) {
      console.log('Player starts attack!');
      set({
        isPlayerAttacking: true,
        attackTimer: 0.5, // Attack lasts 500ms
        attackCooldown: 1.0, // 1 second cooldown
        combatSubPhase: 'timing'
      });
    }
  },
  
  endAttack: () => {
    console.log('Player attack ended');
    set({
      isPlayerAttacking: false,
      attackTimer: 0,
      combatSubPhase: 'normal',
      perfectTiming: false
    });
  },
  
  updateAttackTimer: (delta) => {
    const { attackTimer, attackCooldown, isPlayerAttacking } = get();
    
    // Update attack timer
    if (isPlayerAttacking && attackTimer > 0) {
      const newTimer = attackTimer - delta;
      set({ attackTimer: Math.max(0, newTimer) });
    }
    
    // Update cooldown timer
    if (attackCooldown > 0) {
      const newCooldown = attackCooldown - delta;
      set({ attackCooldown: Math.max(0, newCooldown) });
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
