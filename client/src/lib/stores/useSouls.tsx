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
  reset: () => void; // Complete reset for area transitions
}

export const useSouls = create<SoulsState>((set, get) => ({
  souls: [],
  soulCount: 0,
  totalSouls: 0,
  
  addSoul: (soul) => {
    const { souls } = get();
    
    // Guard against duplicate IDs
    if (souls.find(s => s.id === soul.id)) {
      console.warn(`⚠️ Duplicate soul ID attempted: ${soul.id}`);
      return;
    }
    
    set({ souls: [...souls, soul] });
    console.log(`Soul spawned: ${soul.id} at position (${soul.position.x}, ${soul.position.z})`);
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
  
  reset: () => {
    console.log("🔄 useSouls: Complete reset for area transition");
    set({ souls: [] });
    // Note: We don't reset soulCount/totalSouls as they are accumulated values
  },
}));
