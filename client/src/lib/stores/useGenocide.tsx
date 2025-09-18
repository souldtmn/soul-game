import { create } from "zustand";

type GenocideThreshold = 'baseline' | 'early' | 'mid' | 'late' | 'complete';
type AreaId = 'Vale' | 'Crypt' | 'Abyss';

interface WhisperMessage {
  id: string;
  text: string;
  intensity: number;
  timestamp: number;
}

interface GenocideState {
  // Core tracking systems
  killCount: number; // Remaining enemies in current area
  totalEnemiesRequired: number;
  currentThreshold: GenocideThreshold;
  
  // SOUL Currency and Progression Systems - Phase 2
  ash: number; // Spendable currency from kills
  dust: number; // Total lifetime kills (lore/achievements)
  corruption: number; // Death/revival count (affects gameplay)
  area: AreaId; // Current area progression
  
  // Whisper and UI systems
  activeWhispers: WhisperMessage[];
  genocideComplete: boolean;
  uiCorruptionLevel: number; // 0-1 for progressive UI corruption
  bossUnlocked: boolean; // Boss preparation trigger
  
  // Actions
  incrementKillCount: (ashReward?: number) => void;
  incrementDeath: () => void; // Track player deaths for corruption
  addWhisper: (text: string, intensity: number) => void;
  removeWhisper: (id: string) => void;
  clearWhispers: () => void;
  resetArea: (area: AreaId, enemyCount: number) => void;
  resetGenocide: () => void;
  hardReset: () => void; // Complete game reset
}

// Watcher's Escalating Whisper Tiers - Phase 2 Implementation
const WHISPER_TIERS = {
  early: [ // 10+ enemies left
    "keep going...",
    "another one...",
    "closer."
  ],
  mid: [ // 3-9 enemies left
    "we're almost there.",
    "don't stop.",
    "more."
  ],
  late: [ // 1-2 enemies left
    "ONLY ONE REMAINS",
    "ENOUGH.",
    "you don't live — you only burn."
  ]
};

// Helper function to pick random whisper from tier
const pickRandomWhisper = (tier: string[]): string => {
  return tier[Math.floor(Math.random() * tier.length)];
};

export const useGenocide = create<GenocideState>((set, get) => ({
  // Core tracking - updated for Phase 2
  killCount: 14, // Start with full count, decrement as enemies are defeated
  totalEnemiesRequired: 14,
  currentThreshold: 'baseline',
  
  // SOUL systems - Phase 2 enhancements
  ash: 0, // Spendable currency from kills
  dust: 0, // Total lifetime kills
  corruption: 0, // Death/revival count (0-3+)
  area: 'Vale' as AreaId, // Current area
  
  // UI and state
  activeWhispers: [],
  genocideComplete: false,
  uiCorruptionLevel: 0,
  bossUnlocked: false,
  
  incrementKillCount: (ashReward = 10) => {
    const { killCount, dust, ash, area } = get();
    
    // Award currency and increment counters
    const newAsh = ash + ashReward;
    const newDust = dust + 1;
    const remainingEnemies = Math.max(0, killCount - 1);
    
    console.log(`=== KILL REGISTERED ===`);
    console.log(`Area: ${area} | Ash +${ashReward} (${newAsh} total) | Dust: ${newDust} lifetime kills`);
    console.log(`Enemies remaining: ${remainingEnemies}`);
    
    // Determine whisper tier and intensity based on remaining enemies
    let whisperTier: string[] | null = null;
    let newThreshold: GenocideThreshold = 'baseline';
    let intensity = 0.3;
    
    if (remainingEnemies >= 10) {
      whisperTier = WHISPER_TIERS.early;
      newThreshold = 'early';
      intensity = 0.3;
    } else if (remainingEnemies >= 3) {
      whisperTier = WHISPER_TIERS.mid;
      newThreshold = 'mid';
      intensity = 0.6;
    } else if (remainingEnemies >= 1) {
      whisperTier = WHISPER_TIERS.late;
      newThreshold = 'late';
      intensity = 0.9;
    } else if (remainingEnemies === 0) {
      newThreshold = 'complete';
      intensity = 1.0;
    }
    
    // Trigger whisper if we have a tier
    if (whisperTier) {
      const whisperText = pickRandomWhisper(whisperTier);
      get().addWhisper(whisperText, intensity);
      console.log(`Whisper triggered (${newThreshold}): "${whisperText}"`);
    }
    
    // Check for boss unlock
    const bossUnlocked = remainingEnemies === 0;
    if (bossUnlocked && !get().bossUnlocked) {
      console.log(`=== GENOCIDE COMPLETE IN ${area.toUpperCase()} ===`);
      console.log("Boss preparation sequence unlocked");
    }
    
    set({
      killCount: remainingEnemies,
      ash: newAsh,
      dust: newDust,
      currentThreshold: newThreshold,
      uiCorruptionLevel: intensity,
      genocideComplete: bossUnlocked,
      bossUnlocked
    });
  },
  
  incrementDeath: () => {
    const { corruption, area } = get();
    const newCorruption = corruption + 1;
    
    console.log(`=== PLAYER DEATH RECORDED ===`);
    console.log(`Area: ${area} | Corruption increased: ${newCorruption}`);
    console.log(`Corruption effects: ${newCorruption >= 1 ? 'Visual distortion' : ''} ${newCorruption >= 2 ? 'Timing penalties' : ''} ${newCorruption >= 3 ? 'Severe corruption' : ''}`);
    
    // Add whisper for death
    if (newCorruption === 1) {
      get().addWhisper("you failed them.", 0.7);
    } else if (newCorruption === 2) {
      get().addWhisper("again... and again...", 0.8);
    } else if (newCorruption >= 3) {
      get().addWhisper("you are hollow.", 0.9);
    }
    
    set({ corruption: newCorruption });
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
  
  resetArea: (area: AreaId, enemyCount: number) => {
    console.log(`=== AREA TRANSITION ===`);
    console.log(`New area: ${area} with ${enemyCount} enemies to eliminate`);
    set({
      area,
      killCount: enemyCount,
      totalEnemiesRequired: enemyCount,
      currentThreshold: 'baseline',
      genocideComplete: false,
      bossUnlocked: false,
      uiCorruptionLevel: 0
    });
  },
  
  resetGenocide: () => {
    console.log("Genocide cycle reset (keeping progression data)");
    set({
      killCount: get().totalEnemiesRequired,
      currentThreshold: 'baseline',
      activeWhispers: [],
      genocideComplete: false,
      bossUnlocked: false,
      uiCorruptionLevel: 0
    });
  },
  
  hardReset: () => {
    console.log("=== COMPLETE SOUL SYSTEM RESET ===");
    set({
      killCount: 14,
      totalEnemiesRequired: 14,
      currentThreshold: 'baseline',
      ash: 0,
      dust: 0,
      corruption: 0,
      area: 'Vale' as AreaId,
      activeWhispers: [],
      genocideComplete: false,
      uiCorruptionLevel: 0,
      bossUnlocked: false
    });
  }
}));