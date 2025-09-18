import { create } from "zustand";

type GenocideThreshold = 'baseline' | 'early' | 'mid' | 'late' | 'complete';
type AreaId = 'Vale' | 'Crypt' | 'Abyss';

interface WhisperMessage {
  id: string;
  text: string;
  intensity: number;
  timestamp: number;
}

interface AreaConfig {
  id: AreaId;
  name: string;
  enemyCount: number;
  theme: {
    name: string;
    colorPrimary: string;
    colorSecondary: string;
    corruptionColor: string;
  };
  whispers: {
    early: string[];
    mid: string[];
    late: string[];
    death: string[];
  };
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
  
  // Area progression tracking
  areasCompleted: AreaId[]; // Areas that have been completed
  totalAreasCompleted: number; // Count of completed areas
  
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
  resetArea: (area: AreaId, enemyCount?: number) => void;
  transitionToNextArea: () => void; // Progress to next area
  resetGenocide: () => void;
  hardReset: () => void; // Complete game reset
  getCurrentAreaConfig: () => AreaConfig;
  getNextArea: () => AreaId | null;
}

// Area Configurations - Three-area progression system
const AREA_CONFIGS: Record<AreaId, AreaConfig> = {
  Vale: {
    id: 'Vale',
    name: 'Hollow Vale',
    enemyCount: 14,
    theme: {
      name: 'Forest→Barren Decay',
      colorPrimary: '#e17055',
      colorSecondary: '#74b9ff',
      corruptionColor: '#d63031',
    },
    whispers: {
      early: [
        "keep going...",
        "another one...",
        "closer.",
        "the forest weeps."
      ],
      mid: [
        "we're almost there.",
        "don't stop.",
        "more.",
        "hear them falling."
      ],
      late: [
        "ONLY ONE REMAINS",
        "ENOUGH.",
        "you don't live — you only burn.",
        "THE VALE GOES SILENT."
      ],
      death: [
        "you failed them.",
        "the earth drinks your shame.",
        "even the trees turn away."
      ]
    }
  },
  Crypt: {
    id: 'Crypt',
    name: 'Shattered Crypt',
    enemyCount: 21,
    theme: {
      name: 'Ice→Frost→Void',
      colorPrimary: '#74b9ff',
      colorSecondary: '#a29bfe',
      corruptionColor: '#6c5ce7',
    },
    whispers: {
      early: [
        "the ice cracks...",
        "frozen screams.",
        "deeper.",
        "cold consumes all."
      ],
      mid: [
        "frost spreads.",
        "the void calls.",
        "shatter them.",
        "ice and bone."
      ],
      late: [
        "ETERNAL WINTER COMES",
        "FREEZE THEIR SOULS",
        "THE VOID OPENS.",
        "ALL WILL BE ICE."
      ],
      death: [
        "you shatter like glass.",
        "frozen in failure.",
        "the cold claims you."
      ]
    }
  },
  Abyss: {
    id: 'Abyss',
    name: 'Abyss Below',
    enemyCount: 7,
    theme: {
      name: 'Fire→Ash→Darkness',
      colorPrimary: '#fd79a8',
      colorSecondary: '#e84393',
      corruptionColor: '#2d3436',
    },
    whispers: {
      early: [
        "burn them all.",
        "ash and shadow.",
        "the final descent.",
        "darkness rises."
      ],
      mid: [
        "flames dance.",
        "turn them to ash.",
        "the abyss opens.",
        "nothing remains."
      ],
      late: [
        "BURN EVERYTHING",
        "ASH TO ASH",
        "THE ABYSS CALLS.",
        "ALL IS DARKNESS."
      ],
      death: [
        "you burn in your failure.",
        "consumed by the void.",
        "the abyss takes you."
      ]
    }
  }
};

// Helper function to pick random whisper from tier
const pickRandomWhisper = (tier: string[]): string => {
  return tier[Math.floor(Math.random() * tier.length)];
};

export const useGenocide = create<GenocideState>((set, get) => ({
  // Core tracking - updated for area system
  killCount: 14, // Start with Vale's count
  totalEnemiesRequired: 14,
  currentThreshold: 'baseline',
  
  // SOUL systems - Phase 2 enhancements
  ash: 0, // Spendable currency from kills
  dust: 0, // Total lifetime kills
  corruption: 0, // Death/revival count (0-3+)
  area: 'Vale' as AreaId, // Current area
  
  // Area progression tracking
  areasCompleted: [],
  totalAreasCompleted: 0,
  
  // UI and state
  activeWhispers: [],
  genocideComplete: false,
  uiCorruptionLevel: 0,
  bossUnlocked: false,
  
  incrementKillCount: (ashReward = 10) => {
    const { killCount, dust, ash, area } = get();
    const areaConfig = AREA_CONFIGS[area];
    
    // Award currency and increment counters
    const newAsh = ash + ashReward;
    const newDust = dust + 1;
    const remainingEnemies = Math.max(0, killCount - 1);
    
    console.log(`=== KILL REGISTERED ===`);
    console.log(`Area: ${area} (${areaConfig.name}) | Ash +${ashReward} (${newAsh} total) | Dust: ${newDust} lifetime kills`);
    console.log(`Enemies remaining: ${remainingEnemies}/${areaConfig.enemyCount}`);
    
    // Determine whisper tier and intensity based on remaining enemies and area thresholds
    let whisperTier: string[] | null = null;
    let newThreshold: GenocideThreshold = 'baseline';
    let intensity = 0.3;
    
    // Adjust thresholds based on area enemy count
    const earlyThreshold = Math.floor(areaConfig.enemyCount * 0.7); // 70% remaining
    const midThreshold = Math.floor(areaConfig.enemyCount * 0.3);   // 30% remaining
    
    if (remainingEnemies >= earlyThreshold) {
      whisperTier = areaConfig.whispers.early;
      newThreshold = 'early';
      intensity = 0.3;
    } else if (remainingEnemies >= midThreshold) {
      whisperTier = areaConfig.whispers.mid;
      newThreshold = 'mid';
      intensity = 0.6;
    } else if (remainingEnemies >= 1) {
      whisperTier = areaConfig.whispers.late;
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
    const areaConfig = AREA_CONFIGS[area];
    const newCorruption = corruption + 1;
    
    console.log(`=== PLAYER DEATH RECORDED ===`);
    console.log(`Area: ${area} (${areaConfig.name}) | Corruption increased: ${newCorruption}`);
    console.log(`Corruption effects: ${newCorruption >= 1 ? 'Visual distortion' : ''} ${newCorruption >= 2 ? 'Timing penalties' : ''} ${newCorruption >= 3 ? 'Severe corruption' : ''}`);
    
    // Add area-specific death whisper
    const deathWhisper = pickRandomWhisper(areaConfig.whispers.death);
    get().addWhisper(deathWhisper, 0.7 + Math.min(newCorruption * 0.1, 0.2));
    console.log(`Death whisper (${area}): "${deathWhisper}"`);
    
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
  
  resetArea: (area: AreaId, enemyCount?: number) => {
    const areaConfig = AREA_CONFIGS[area];
    const enemies = enemyCount || areaConfig.enemyCount;
    
    console.log(`=== AREA TRANSITION ===`);
    console.log(`New area: ${area} (${areaConfig.name}) with ${enemies} enemies to eliminate`);
    set({
      area,
      killCount: enemies,
      totalEnemiesRequired: enemies,
      currentThreshold: 'baseline',
      genocideComplete: false,
      bossUnlocked: false,
      uiCorruptionLevel: 0
    });
  },

  transitionToNextArea: () => {
    const { area, areasCompleted } = get();
    const nextArea = get().getNextArea();
    
    if (nextArea) {
      const currentAreaConfig = AREA_CONFIGS[area];
      const nextAreaConfig = AREA_CONFIGS[nextArea];
      
      console.log(`=== AREA COMPLETION & TRANSITION ===`);
      console.log(`${area} (${currentAreaConfig.name}) COMPLETED!`);
      console.log(`Transitioning to ${nextArea} (${nextAreaConfig.name})`);
      console.log(`Target enemy count for ${nextArea}: ${nextAreaConfig.enemyCount}`);
      
      // ATOMIC STATE TRANSITION: Clear all arrays and reset counters
      const { useEnemies } = require('./useEnemies');
      const { useSouls } = require('./useSouls');
      
      // Clear enemies and souls arrays atomically
      useEnemies.getState().reset();
      useSouls.getState().reset();
      console.log("✅ Enemies and souls arrays cleared for area transition");
      
      // Mark current area as completed
      const newAreasCompleted = [...areasCompleted, area];
      
      // ATOMIC GENOCIDE STATE UPDATE
      set({
        area: nextArea,
        killCount: nextAreaConfig.enemyCount, // Reset to full enemy count for new area
        totalEnemiesRequired: nextAreaConfig.enemyCount,
        areasCompleted: newAreasCompleted,
        totalAreasCompleted: newAreasCompleted.length,
        currentThreshold: 'baseline',
        genocideComplete: false,
        bossUnlocked: false,
        uiCorruptionLevel: 0
      });
      
      console.log(`✅ Area transition complete: ${area} → ${nextArea}`);
      console.log(`✅ killCount reset to ${nextAreaConfig.enemyCount} for ${nextArea}`);
      console.log(`✅ bossUnlocked reset to false`);
      console.log(`✅ Areas completed: ${newAreasCompleted.length}/3 (${newAreasCompleted.join(', ')})`);
      
      // Add transition whisper
      get().addWhisper(`Entering ${nextAreaConfig.name}...`, 0.8);
      
      // Log expected next behavior
      console.log(`Expected: Room component should respawn ${nextAreaConfig.enemyCount} enemies for ${nextArea}`);
    } else {
      console.log(`=== FINAL AREA COMPLETED ===`);
      console.log("All areas have been consumed. The cycle ends.");
      console.log("🎯 GAME COMPLETE: Vale → Crypt → Abyss progression finished");
      get().addWhisper("All is ash. All is void.", 1.0);
    }
  },

  getCurrentAreaConfig: () => {
    return AREA_CONFIGS[get().area];
  },

  getNextArea: (): AreaId | null => {
    const { area } = get();
    const areaProgression: AreaId[] = ['Vale', 'Crypt', 'Abyss'];
    const currentIndex = areaProgression.indexOf(area);
    
    if (currentIndex < areaProgression.length - 1) {
      return areaProgression[currentIndex + 1];
    }
    return null; // No more areas
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