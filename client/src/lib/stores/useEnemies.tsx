import { create } from "zustand";
import * as THREE from "three";
import { useSouls } from "./useSouls";
import { MAX_EXPLORATION_ENEMIES } from "../constants";


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
  reset: () => void; // Complete reset for area transitions
}

export const useEnemies = create<EnemiesState>((set, get) => ({
  enemies: [],
  
  addEnemy: (enemy: Enemy) => {
    const { enemies } = get();

    // Guard against duplicate IDs (clean retype)
    if (enemies.some((e) => e.id === enemy.id)) {
      console.warn(`Duplicate enemy ID attempted: ${enemy.id}`);
      return;
    }

    // Cap to stabilize exploration
    if (enemies.length >= MAX_EXPLORATION_ENEMIES) {
      console.warn(`Max exploration enemies (${MAX_EXPLORATION_ENEMIES}) reached; not adding: ${enemy.id}`);
      return;
    }

    set({ enemies: [...enemies, enemy] });
    console.log(`Enemy added: ${enemy.id}`);
  },
  
  removeEnemy: (id) => {
    const { enemies } = get();
    const enemyToRemove = enemies.find(e => e.id === id);
    
    if (enemyToRemove) {
      // Extract area from enemy ID (format: Area_enemyX)
      const areaParts = id.split('_');
      const currentArea = areaParts.length > 1 ? areaParts[0] : 'Vale'; // fallback to Vale
      
      // Create soul at enemy position with globally unique area-prefixed ID
      const { addSoul } = useSouls.getState();
      addSoul({
        id: `${currentArea}_soul_${id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: enemyToRemove.position.clone(),
        collected: false,
        value: enemyToRemove.type === 'strong' ? 15 : 10
      });
      
      console.log(`✨ Soul created: ${currentArea}_soul_${id} (from enemy ${id})`);
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
  
  reset: () => {
    console.log("🔄 useEnemies: Complete reset for area transition");
    set({ enemies: [] });
  },
}));
