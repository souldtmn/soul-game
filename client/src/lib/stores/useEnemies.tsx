import { create } from "zustand";
import * as THREE from "three";
import { useSouls } from "./useSouls";

interface Enemy {
  id: string;
  position: THREE.Vector3;
  health: number;
  maxHealth: number;
  type: 'basic' | 'strong';
  lastAttackTime: number;
}

interface EnemiesState {
  enemies: Enemy[];
  
  // Actions
  addEnemy: (enemy: Enemy) => void;
  removeEnemy: (id: string) => void;
  updateEnemy: (id: string, updates: Partial<Enemy>) => void;
  clearEnemies: () => void;
}

export const useEnemies = create<EnemiesState>((set, get) => ({
  enemies: [],
  
  addEnemy: (enemy) => {
    set({ enemies: [...get().enemies, enemy] });
    console.log(`Enemy added: ${enemy.id}`);
  },
  
  removeEnemy: (id) => {
    const { enemies } = get();
    const enemyToRemove = enemies.find(e => e.id === id);
    
    if (enemyToRemove) {
      // Create soul at enemy position
      const { addSoul } = useSouls.getState();
      addSoul({
        id: `soul_${id}_${Date.now()}`,
        position: enemyToRemove.position.clone(),
        collected: false,
        value: enemyToRemove.type === 'strong' ? 15 : 10
      });
    }
    
    set({ enemies: enemies.filter(e => e.id !== id) });
    console.log(`Enemy removed: ${id}`);
  },
  
  updateEnemy: (id, updates) => {
    set({
      enemies: get().enemies.map(enemy =>
        enemy.id === id ? { ...enemy, ...updates } : enemy
      )
    });
  },
  
  clearEnemies: () => {
    set({ enemies: [] });
  },
}));
