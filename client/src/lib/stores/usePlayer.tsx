import { create } from "zustand";
import * as THREE from "three";

interface PlayerState {
  position: THREE.Vector3;
  health: number;
  maxHealth: number;
  isInvulnerable: boolean;
  invulnerabilityTimer: number;
  
  // Actions
  setPosition: (x: number, y: number, z: number) => void;
  takeDamage: (damage: number) => void;
  heal: (amount: number) => void;
  setInvulnerable: (invulnerable: boolean) => void;
  updateInvulnerabilityTimer: (delta: number) => void;
  resetPlayer: () => void;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  position: new THREE.Vector3(0, 0, 0),
  health: 100,
  maxHealth: 100,
  isInvulnerable: false,
  invulnerabilityTimer: 0,
  
  setPosition: (x, y, z) => {
    set({ position: new THREE.Vector3(x, y, z) });
  },
  
  takeDamage: (damage) => {
    const { health, isInvulnerable } = get();
    if (isInvulnerable) return;
    
    const newHealth = Math.max(0, health - damage);
    set({ 
      health: newHealth,
      isInvulnerable: true,
      invulnerabilityTimer: 1.0 // 1 second invulnerability
    });
    
    console.log(`Player took ${damage} damage! Health: ${newHealth}`);
  },
  
  heal: (amount) => {
    const { health, maxHealth } = get();
    const newHealth = Math.min(maxHealth, health + amount);
    set({ health: newHealth });
    console.log(`Player healed for ${amount}! Health: ${newHealth}`);
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
    set({
      position: new THREE.Vector3(0, 0, 0),
      health: 100,
      isInvulnerable: false,
      invulnerabilityTimer: 0,
    });
  },
}));
