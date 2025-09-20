import { create } from "zustand";
import * as THREE from "three";
import { CombatantStats } from "../systems/CombatantStats";

interface PlayerState {
  position: THREE.Vector3;
  stats: CombatantStats;
  isInvulnerable: boolean;
  invulnerabilityTimer: number;
  
  // Legacy getters for compatibility
  health: number;
  maxHealth: number;
  
  // Actions
  setPosition: (x: number, y: number, z: number) => void;
  takeDamage: (damage: number) => void;
  heal: (amount: number) => void;
  setInvulnerable: (invulnerable: boolean) => void;
  updateInvulnerabilityTimer: (delta: number) => void;
  resetPlayer: () => void;
  
  // New stat management
  getStats: () => CombatantStats;
  upgradeStats: (maxHP?: number, power?: number, armor?: number) => void;
}

export const usePlayer = create<PlayerState>((set, get) => {
  // Initialize player stats with events
  const playerStats = new CombatantStats(
    100, // maxHP
    0.2, // power (20% damage bonus)
    0.1, // armor (10% damage reduction)
    {
      onDamageTaken: (damage, newHP, maxHP) => {
        console.log(`Player took ${damage} damage! Health: ${newHP}/${maxHP}`);
      },
      onHealed: (amount, newHP, maxHP) => {
        console.log(`Player healed for ${amount}! Health: ${newHP}/${maxHP}`);
      },
      onDeath: () => {
        console.log('💀 Player defeated!');
      }
    }
  );

  return {
    position: new THREE.Vector3(0, 0, 0),
    stats: playerStats,
    isInvulnerable: false,
    invulnerabilityTimer: 0,
    
    // Legacy getters for compatibility
    get health() { return get().stats.hp; },
    get maxHealth() { return get().stats.maxHP; },
  
  setPosition: (x, y, z) => {
    set({ position: new THREE.Vector3(x, y, z) });
  },
  
    takeDamage: (damage) => {
      const { stats, isInvulnerable } = get();
      if (isInvulnerable || damage <= 0) return;
      
      stats.takeDamage(damage);
      set({ 
        isInvulnerable: true,
        invulnerabilityTimer: 1.0 // 1 second invulnerability
      });
    },
  
    heal: (amount) => {
      const { stats } = get();
      stats.heal(amount);
    },
  
  setInvulnerable: (invulnerable) => {
    set({ isInvulnerable: invulnerable });
  },
  
  updateInvulnerabilityTimer: (delta) => {
    const { invulnerabilityTimer, isInvulnerable } = get();
    if (isInvulnerable && invulnerabilityTimer > 0) {
      const newTimer = invulnerabilityTimer - delta;
      if (newTimer <= 0) {
        set({ isInvulnerable: false, invulnerabilityTimer: 0 });
      } else {
        set({ invulnerabilityTimer: newTimer });
      }
    }
    },
  
    resetPlayer: () => {
      const { stats } = get();
      stats.fullHeal();
      set({
        position: new THREE.Vector3(0, 0, 0),
        isInvulnerable: false,
        invulnerabilityTimer: 0,
      });
    },
    
    // New stat management methods
    getStats: () => {
      return get().stats;
    },
    
    upgradeStats: (maxHP, power, armor) => {
      const { stats } = get();
      if (maxHP !== undefined) stats.setMaxHP(maxHP);
      if (power !== undefined) stats.setPower(power);
      if (armor !== undefined) stats.setArmor(armor);
    },
  };
});
