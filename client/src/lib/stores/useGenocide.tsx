import { create } from "zustand";

type GenocideThreshold = 'baseline' | 'early' | 'mid' | 'late' | 'complete';

interface WhisperMessage {
  id: string;
  text: string;
  intensity: number;
  timestamp: number;
}

interface GenocideState {
  killCount: number;
  totalEnemiesRequired: number;
  currentThreshold: GenocideThreshold;
  activeWhispers: WhisperMessage[];
  genocideComplete: boolean;
  uiCorruptionLevel: number; // 0-1 for progressive UI corruption
  
  // Actions
  incrementKillCount: () => void;
  addWhisper: (text: string, intensity: number) => void;
  removeWhisper: (id: string) => void;
  clearWhispers: () => void;
  resetGenocide: () => void;
}

const GENOCIDE_MESSAGES = {
  early: "Keep going...",
  mid: "Almost there...",
  late: "Only one remains...",
  complete: "It is done."
};

export const useGenocide = create<GenocideState>((set, get) => ({
  killCount: 0,
  totalEnemiesRequired: 14,
  currentThreshold: 'baseline',
  activeWhispers: [],
  genocideComplete: false,
  uiCorruptionLevel: 0,
  
  incrementKillCount: () => {
    const { killCount, totalEnemiesRequired } = get();
    const newKillCount = killCount + 1;
    
    console.log(`Kill count: ${newKillCount}/${totalEnemiesRequired} toward genocide`);
    
    // Determine new threshold
    let newThreshold: GenocideThreshold = 'baseline';
    let newCorruption = 0;
    
    if (newKillCount >= 14) {
      newThreshold = 'complete';
      newCorruption = 1.0;
    } else if (newKillCount >= 12) {
      newThreshold = 'late';
      newCorruption = 0.8;
    } else if (newKillCount >= 8) {
      newThreshold = 'mid';
      newCorruption = 0.6;
    } else if (newKillCount >= 4) {
      newThreshold = 'early';
      newCorruption = 0.3;
    }
    
    // Check if threshold changed to trigger whisper
    const currentThreshold = get().currentThreshold;
    if (newThreshold !== currentThreshold && newThreshold !== 'baseline') {
      const message = GENOCIDE_MESSAGES[newThreshold as keyof typeof GENOCIDE_MESSAGES];
      get().addWhisper(message, newCorruption);
      console.log(`Genocide threshold reached: ${newThreshold} - "${message}"`);
    }
    
    // Check if genocide is complete
    const genocideComplete = newKillCount >= totalEnemiesRequired;
    if (genocideComplete && !get().genocideComplete) {
      console.log("GENOCIDE COMPLETE - Boss spawn preparation triggered");
    }
    
    set({
      killCount: newKillCount,
      currentThreshold: newThreshold,
      uiCorruptionLevel: newCorruption,
      genocideComplete
    });
  },
  
  addWhisper: (text, intensity) => {
    const whisperId = `whisper_${Date.now()}_${Math.random()}`;
    const newWhisper: WhisperMessage = {
      id: whisperId,
      text,
      intensity,
      timestamp: Date.now()
    };
    
    set({
      activeWhispers: [...get().activeWhispers, newWhisper]
    });
    
    // Auto-remove whisper after 4 seconds
    setTimeout(() => {
      get().removeWhisper(whisperId);
    }, 4000);
  },
  
  removeWhisper: (id) => {
    set({
      activeWhispers: get().activeWhispers.filter(w => w.id !== id)
    });
  },
  
  clearWhispers: () => {
    set({ activeWhispers: [] });
  },
  
  resetGenocide: () => {
    console.log("Genocide progress reset");
    set({
      killCount: 0,
      currentThreshold: 'baseline',
      activeWhispers: [],
      genocideComplete: false,
      uiCorruptionLevel: 0
    });
  }
}));