import { create } from "zustand";
import * as THREE from "three";

interface Soul {
  id: string;
  position: THREE.Vector3;
  collected: boolean;
  value: number;
}

interface SoulsState {
  souls: Soul[];
  soulCount: number;
  totalSouls: number;
  
  // Actions
  addSoul: (soul: Soul) => void;
  collectSoul: (id: string) => void;
  clearSouls: () => void;
}

export const useSouls = create<SoulsState>((set, get) => ({
  souls: [],
  soulCount: 0,
  totalSouls: 0,
  
  addSoul: (soul) => {
    set({ souls: [...get().souls, soul] });
    console.log(`Soul spawned at position: ${soul.position.x}, ${soul.position.z}`);
  },
  
  collectSoul: (id) => {
    const { souls, soulCount, totalSouls } = get();
    const soul = souls.find(s => s.id === id);
    
    if (soul && !soul.collected) {
      set({
        souls: souls.map(s => 
          s.id === id ? { ...s, collected: true } : s
        ),
        soulCount: soulCount + soul.value,
        totalSouls: totalSouls + soul.value
      });
      
      // Remove collected souls after a short delay
      setTimeout(() => {
        set({
          souls: get().souls.filter(s => s.id !== id)
        });
      }, 100);
      
      console.log(`Soul collected! Value: ${soul.value}, Total: ${get().totalSouls}`);
    }
  },
  
  clearSouls: () => {
    set({ souls: [], soulCount: 0, totalSouls: 0 });
  },
}));
