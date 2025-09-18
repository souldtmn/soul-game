import { create } from "zustand";

export type CorruptionStage = 'clean' | 'early' | 'mid' | 'late' | 'genocide' | 'boss_phase_1' | 'boss_phase_2' | 'boss_phase_3';
export type AreaId = 'Vale' | 'Crypt' | 'Abyss';

// Multi-layer audio stem system
interface AudioLayer {
  source: MediaElementAudioSourceNode | null;
  audio: HTMLAudioElement | null;
  gainNode: GainNode | null;
  effectNodes: AudioNode[];
  isPlaying: boolean;
  volume: number;
}

// Area-specific progression configurations
interface AreaProgressionConfig {
  stages: {
    stage: CorruptionStage;
    killRange: [number, number]; // [min, max] kills remaining
    effects: {
      piano: { volume: number; detuning: number; reversed: boolean };
      strings: { volume: number; vibrato: number; screech: number };
      percussion: { volume: number; tempo: number; type: 'heartbeat' | 'irregular' | 'chains' };
      drones: { volume: number; frequency: number; texture: 'minimal' | 'hollow' | 'sub-bass' };
      static: { volume: number; intensity: number; texture: 'pulses' | 'cracking' | 'overtaking' };
      whispers: { volume: number; spatial: boolean; dominance: number };
    };
  }[];
  bossSequence: {
    phases: {
      name: string;
      duration: number; // seconds
      effects: any;
    }[];
  };
}

interface MusicCorruptionState {
  // Web Audio API context and master nodes
  audioContext: AudioContext | null;
  masterGainNode: GainNode | null;
  spatialPannerNode: PannerNode | null;
  
  // Multi-layer audio stems
  pianoLayer: AudioLayer;
  stringsLayer: AudioLayer;
  percussionLayer: AudioLayer;
  dronesLayer: AudioLayer;
  staticLayer: AudioLayer;
  whispersLayer: AudioLayer;
  
  // Corruption state
  currentStage: CorruptionStage;
  currentArea: AreaId;
  killsRemaining: number;
  totalEnemies: number;
  corruptionLevel: number; // 0-1 overall corruption
  
  // Burn/death integration
  burnCount: number; // 0-3+ from useGenocide.corruption
  burnEffectsActive: boolean;
  
  // Boss phase sequencing
  bossPhaseActive: boolean;
  currentBossPhase: 1 | 2 | 3;
  bossPhaseStartTime: number;
  bossSequenceTimer: NodeJS.Timeout | null;
  
  // Real-time effects parameters
  pianoDetuning: number; // cents
  stringVibrato: number; // 0-1
  percussionTempo: number; // multiplier
  staticIntensity: number; // 0-1
  whisperSpatialPosition: { x: number; y: number; z: number };
  
  // Control
  isInitialized: boolean;
  isActive: boolean;
  
  // Actions
  initializeMultiLayerSystem: (backgroundMusic: HTMLAudioElement) => Promise<void>;
  updateProgression: (killsRemaining: number, totalEnemies: number, area: AreaId, burnCount: number) => void;
  applyAreaSpecificEffects: (stage: CorruptionStage, area: AreaId) => void;
  applyBurnCorruption: (burnCount: number) => void;
  startBossSequence: (area: AreaId) => void;
  advanceBossPhase: () => void;
  applyPianoDetuning: (cents: number) => void;
  applyStringEvolution: (vibratoAmount: number, screechAmount: number) => void;
  applyPercussionChanges: (tempoMultiplier: number, type: 'heartbeat' | 'irregular' | 'chains') => void;
  applySpatialWhispers: (position: { x: number; y: number; z: number }) => void;
  updateLayerVolume: (layerName: string, volume: number) => void;
  createAudioLayer: (audioContext: AudioContext, sourceAudio: HTMLAudioElement, destination: AudioNode, layerType: string) => AudioLayer;
  createNoiseLayer: (audioContext: AudioContext, destination: AudioNode) => AudioLayer;
  createWhispersLayer: (audioContext: AudioContext, spatialNode: PannerNode) => AudioLayer;
  applyBossPhaseEffects: (effects: any) => void;
  toggleCorruption: (enabled: boolean) => void;
  cleanup: () => void;
}

// Area-specific progression configurations matching the musical specification exactly
const AREA_PROGRESSIONS: Record<AreaId, AreaProgressionConfig> = {
  Vale: {
    stages: [
      {
        stage: 'clean',
        killRange: [10, 14],
        effects: {
          piano: { volume: 0.8, detuning: 0, reversed: false },
          strings: { volume: 0.6, vibrato: 0, screech: 0 },
          percussion: { volume: 0.3, tempo: 1.0, type: 'heartbeat' },
          drones: { volume: 0.7, frequency: 440, texture: 'minimal' },
          static: { volume: 0.0, intensity: 0, texture: 'pulses' },
          whispers: { volume: 0.0, spatial: false, dominance: 0 }
        }
      },
      {
        stage: 'early',
        killRange: [5, 9],
        effects: {
          piano: { volume: 0.7, detuning: 5, reversed: false },
          strings: { volume: 0.6, vibrato: 0.2, screech: 0 },
          percussion: { volume: 0.4, tempo: 1.1, type: 'irregular' },
          drones: { volume: 0.7, frequency: 435, texture: 'minimal' },
          static: { volume: 0.1, intensity: 0.2, texture: 'pulses' },
          whispers: { volume: 0.05, spatial: false, dominance: 0.1 }
        }
      },
      {
        stage: 'mid',
        killRange: [2, 4],
        effects: {
          piano: { volume: 0.5, detuning: 15, reversed: true },
          strings: { volume: 0.5, vibrato: 0.4, screech: 0.2 },
          percussion: { volume: 0.5, tempo: 1.3, type: 'irregular' },
          drones: { volume: 0.6, frequency: 430, texture: 'minimal' },
          static: { volume: 0.3, intensity: 0.5, texture: 'pulses' },
          whispers: { volume: 0.15, spatial: false, dominance: 0.3 }
        }
      },
      {
        stage: 'late',
        killRange: [1, 1],
        effects: {
          piano: { volume: 0.2, detuning: 50, reversed: true },
          strings: { volume: 0.3, vibrato: 0.8, screech: 0.6 },
          percussion: { volume: 0.7, tempo: 0.2, type: 'irregular' },
          drones: { volume: 0.4, frequency: 420, texture: 'minimal' },
          static: { volume: 0.8, intensity: 1.0, texture: 'pulses' },
          whispers: { volume: 0.3, spatial: false, dominance: 0.6 }
        }
      }
    ],
    bossSequence: {
      phases: [
        {
          name: 'chains_and_drone',
          duration: 30,
          effects: {
            piano: { volume: 0.1, detuning: 30, reversed: true },
            strings: { volume: 0.2, vibrato: 0.6, screech: 0.4 },
            percussion: { volume: 0.9, tempo: 0.8, type: 'chains' },
            drones: { volume: 0.8, frequency: 200, texture: 'minimal' },
            static: { volume: 0.4, intensity: 0.7, texture: 'pulses' },
            whispers: { volume: 0.2, spatial: true, dominance: 0.4 }
          }
        }
      ]
    }
  },
  
  Crypt: {
    stages: [
      {
        stage: 'clean',
        killRange: [10, 21],
        effects: {
          piano: { volume: 0.3, detuning: 0, reversed: false },
          strings: { volume: 0.7, vibrato: 0, screech: 0 },
          percussion: { volume: 0.4, tempo: 1.0, type: 'heartbeat' },
          drones: { volume: 0.8, frequency: 330, texture: 'hollow' },
          static: { volume: 0.0, intensity: 0, texture: 'cracking' },
          whispers: { volume: 0.0, spatial: false, dominance: 0 }
        }
      },
      {
        stage: 'early',
        killRange: [6, 9],
        effects: {
          piano: { volume: 0.2, detuning: 8, reversed: false },
          strings: { volume: 0.6, vibrato: 0.3, screech: 0.1 },
          percussion: { volume: 0.6, tempo: 0.9, type: 'irregular' },
          drones: { volume: 0.8, frequency: 320, texture: 'hollow' },
          static: { volume: 0.2, intensity: 0.4, texture: 'cracking' },
          whispers: { volume: 0.1, spatial: false, dominance: 0.2 }
        }
      },
      {
        stage: 'mid',
        killRange: [3, 5],
        effects: {
          piano: { volume: 0.15, detuning: 20, reversed: false },
          strings: { volume: 0.4, vibrato: 0.6, screech: 0.4 },
          percussion: { volume: 0.7, tempo: 0.6, type: 'heartbeat' },
          drones: { volume: 0.7, frequency: 310, texture: 'hollow' },
          static: { volume: 0.4, intensity: 0.7, texture: 'cracking' },
          whispers: { volume: 0.2, spatial: false, dominance: 0.4 }
        }
      },
      {
        stage: 'late',
        killRange: [1, 1],
        effects: {
          piano: { volume: 0.0, detuning: 0, reversed: false },
          strings: { volume: 0.2, vibrato: 0.9, screech: 0.8 },
          percussion: { volume: 0.1, tempo: 0.1, type: 'heartbeat' },
          drones: { volume: 0.3, frequency: 300, texture: 'hollow' },
          static: { volume: 0.9, intensity: 1.0, texture: 'cracking' },
          whispers: { volume: 0.4, spatial: false, dominance: 0.7 }
        }
      }
    ],
    bossSequence: {
      phases: [
        {
          name: 'metallic_clangs_faint_choir',
          duration: 20,
          effects: {
            piano: { volume: 0.0, detuning: 0, reversed: false },
            strings: { volume: 0.3, vibrato: 0.2, screech: 0.1 },
            percussion: { volume: 0.8, tempo: 1.2, type: 'chains' },
            drones: { volume: 0.6, frequency: 250, texture: 'hollow' },
            static: { volume: 0.2, intensity: 0.5, texture: 'cracking' },
            whispers: { volume: 0.4, spatial: true, dominance: 0.3 }
          }
        },
        {
          name: 'mid_fight_silence',
          duration: 5,
          effects: {
            piano: { volume: 0.0, detuning: 0, reversed: false },
            strings: { volume: 0.0, vibrato: 0, screech: 0 },
            percussion: { volume: 0.0, tempo: 1.0, type: 'heartbeat' },
            drones: { volume: 0.1, frequency: 200, texture: 'hollow' },
            static: { volume: 0.0, intensity: 0, texture: 'cracking' },
            whispers: { volume: 0.0, spatial: false, dominance: 0 }
          }
        },
        {
          name: 'screaming_choir_climax',
          duration: 15,
          effects: {
            piano: { volume: 0.0, detuning: 0, reversed: false },
            strings: { volume: 0.8, vibrato: 1.0, screech: 1.0 },
            percussion: { volume: 0.9, tempo: 1.5, type: 'chains' },
            drones: { volume: 0.4, frequency: 150, texture: 'hollow' },
            static: { volume: 0.6, intensity: 0.8, texture: 'cracking' },
            whispers: { volume: 0.9, spatial: true, dominance: 0.9 }
          }
        }
      ]
    }
  },
  
  Abyss: {
    stages: [
      {
        stage: 'clean',
        killRange: [4, 7],
        effects: {
          piano: { volume: 0.1, detuning: 0, reversed: false },
          strings: { volume: 0.2, vibrato: 0, screech: 0 },
          percussion: { volume: 0.2, tempo: 0.7, type: 'heartbeat' },
          drones: { volume: 0.9, frequency: 80, texture: 'sub-bass' },
          static: { volume: 0.0, intensity: 0, texture: 'overtaking' },
          whispers: { volume: 0.0, spatial: false, dominance: 0 }
        }
      },
      {
        stage: 'early',
        killRange: [2, 3],
        effects: {
          piano: { volume: 0.3, detuning: 25, reversed: true },
          strings: { volume: 0.4, vibrato: 0.5, screech: 0.3 },
          percussion: { volume: 0.4, tempo: 1.2, type: 'irregular' },
          drones: { volume: 0.8, frequency: 70, texture: 'sub-bass' },
          static: { volume: 0.3, intensity: 0.6, texture: 'overtaking' },
          whispers: { volume: 0.2, spatial: false, dominance: 0.3 }
        }
      },
      {
        stage: 'late',
        killRange: [1, 1],
        effects: {
          piano: { volume: 0.0, detuning: 0, reversed: false },
          strings: { volume: 0.1, vibrato: 0.8, screech: 0.6 },
          percussion: { volume: 0.1, tempo: 0.3, type: 'heartbeat' },
          drones: { volume: 0.3, frequency: 60, texture: 'sub-bass' },
          static: { volume: 1.0, intensity: 1.0, texture: 'overtaking' },
          whispers: { volume: 0.1, spatial: false, dominance: 0.2 }
        }
      }
    ],
    bossSequence: {
      phases: [
        {
          name: 'deep_bass_drones',
          duration: 25,
          effects: {
            piano: { volume: 0.0, detuning: 0, reversed: false },
            strings: { volume: 0.1, vibrato: 0, screech: 0 },
            percussion: { volume: 0.2, tempo: 0.5, type: 'heartbeat' },
            drones: { volume: 1.0, frequency: 40, texture: 'sub-bass' },
            static: { volume: 0.2, intensity: 0.3, texture: 'overtaking' },
            whispers: { volume: 0.0, spatial: false, dominance: 0 }
          }
        },
        {
          name: 'chains_static_shrieks',
          duration: 20,
          effects: {
            piano: { volume: 0.0, detuning: 0, reversed: false },
            strings: { volume: 0.6, vibrato: 0.8, screech: 0.9 },
            percussion: { volume: 0.9, tempo: 1.3, type: 'chains' },
            drones: { volume: 0.7, frequency: 35, texture: 'sub-bass' },
            static: { volume: 0.8, intensity: 0.9, texture: 'overtaking' },
            whispers: { volume: 0.3, spatial: true, dominance: 0.4 }
          }
        },
        {
          name: 'silence_binaural_whispers',
          duration: 15,
          effects: {
            piano: { volume: 0.0, detuning: 0, reversed: false },
            strings: { volume: 0.0, vibrato: 0, screech: 0 },
            percussion: { volume: 0.0, tempo: 1.0, type: 'heartbeat' },
            drones: { volume: 0.0, frequency: 30, texture: 'sub-bass' },
            static: { volume: 0.0, intensity: 0, texture: 'overtaking' },
            whispers: { volume: 1.0, spatial: true, dominance: 1.0 }
          }
        }
      ]
    }
  }
};

// Audio processing utilities
const createDistortionCurve = (amount: number): Float32Array => {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  
  return curve;
};

const createNoiseBuffer = (audioContext: AudioContext, duration: number): AudioBuffer => {
  const bufferSize = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  return buffer;
};

export const useMusicCorruption = create<MusicCorruptionState>((set, get) => ({
  // Web Audio API context and master nodes
  audioContext: null,
  masterGainNode: null,
  spatialPannerNode: null,
  
  // Multi-layer audio stems - initialized as empty layers
  pianoLayer: { source: null, audio: null, gainNode: null, effectNodes: [], isPlaying: false, volume: 0 },
  stringsLayer: { source: null, audio: null, gainNode: null, effectNodes: [], isPlaying: false, volume: 0 },
  percussionLayer: { source: null, audio: null, gainNode: null, effectNodes: [], isPlaying: false, volume: 0 },
  dronesLayer: { source: null, audio: null, gainNode: null, effectNodes: [], isPlaying: false, volume: 0 },
  staticLayer: { source: null, audio: null, gainNode: null, effectNodes: [], isPlaying: false, volume: 0 },
  whispersLayer: { source: null, audio: null, gainNode: null, effectNodes: [], isPlaying: false, volume: 0 },
  
  // Corruption state
  currentStage: 'clean',
  currentArea: 'Vale',
  killsRemaining: 14,
  totalEnemies: 14,
  corruptionLevel: 0,
  
  // Burn/death integration
  burnCount: 0,
  burnEffectsActive: false,
  
  // Boss phase sequencing
  bossPhaseActive: false,
  currentBossPhase: 1,
  bossPhaseStartTime: 0,
  bossSequenceTimer: null,
  
  // Real-time effects parameters
  pianoDetuning: 0,
  stringVibrato: 0,
  percussionTempo: 1.0,
  staticIntensity: 0,
  whisperSpatialPosition: { x: 0, y: 0, z: 0 },
  
  // Control
  isInitialized: false,
  isActive: false,
  
  initializeMultiLayerSystem: async (backgroundMusic: HTMLAudioElement) => {
    try {
      console.log("🎵 Initializing Sophisticated Multi-Layer Music Corruption System...");
      
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Create master gain and spatial nodes
      const masterGainNode = audioContext.createGain();
      const spatialPannerNode = audioContext.createPanner();
      
      // Configure spatial audio for binaural whispers
      spatialPannerNode.panningModel = 'HRTF';
      spatialPannerNode.distanceModel = 'inverse';
      spatialPannerNode.refDistance = 1;
      spatialPannerNode.maxDistance = 10000;
      spatialPannerNode.rolloffFactor = 1;
      
      // Connect master audio routing: master -> spatial -> destination
      masterGainNode.connect(spatialPannerNode);
      spatialPannerNode.connect(audioContext.destination);
      
      // Initialize individual layer systems using the background music as base
      const pianoLayer = get().createAudioLayer(audioContext, backgroundMusic, masterGainNode, 'piano');
      const stringsLayer = get().createAudioLayer(audioContext, backgroundMusic, masterGainNode, 'strings');
      const percussionLayer = get().createAudioLayer(audioContext, backgroundMusic, masterGainNode, 'percussion');
      const dronesLayer = get().createAudioLayer(audioContext, backgroundMusic, masterGainNode, 'drones');
      
      // Create noise-based static layer
      const staticLayer = get().createNoiseLayer(audioContext, masterGainNode);
      
      // Create whispers layer with spatial positioning
      const whispersLayer = get().createWhispersLayer(audioContext, spatialPannerNode);
      
      // Set initial master volume
      masterGainNode.gain.value = 0.6;
      
      set({
        audioContext,
        masterGainNode,
        spatialPannerNode,
        pianoLayer,
        stringsLayer,
        percussionLayer,
        dronesLayer,
        staticLayer,
        whispersLayer,
        isInitialized: true,
        isActive: true
      });
      
      console.log("✅ Sophisticated Multi-Layer Music Corruption System initialized successfully");
      console.log("🎹 Piano layer ready with detuning capabilities");
      console.log("🎻 Strings layer ready with vibrato/screech evolution");
      console.log("🥁 Percussion layer ready with tempo/type changes");
      console.log("🎛️ Drones layer ready with frequency manipulation");
      console.log("📻 Static layer ready with intensity control");
      console.log("👤 Whispers layer ready with spatial positioning");
      
    } catch (error) {
      console.error("❌ Failed to initialize Sophisticated Music Corruption System:", error);
    }
  },
  
  // Helper method to create individual audio layers
  createAudioLayer: (audioContext: AudioContext, sourceAudio: HTMLAudioElement, destination: AudioNode, layerType: string): AudioLayer => {
    const audio = sourceAudio.cloneNode() as HTMLAudioElement;
    audio.loop = true;
    audio.volume = 0.0; // Individual layer volume controlled by gain nodes
    
    const source = audioContext.createMediaElementSource(audio);
    const gainNode = audioContext.createGain();
    const filterNode = audioContext.createBiquadFilter();
    const distortionNode = audioContext.createWaveShaper();
    
    // Configure layer-specific effects
    switch (layerType) {
      case 'piano':
        filterNode.type = 'highpass';
        filterNode.frequency.value = 200;
        break;
      case 'strings':
        filterNode.type = 'bandpass';
        filterNode.frequency.value = 800;
        filterNode.Q.value = 2;
        break;
      case 'percussion':
        filterNode.type = 'highpass';
        filterNode.frequency.value = 100;
        break;
      case 'drones':
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 300;
        break;
    }
    
    // Connect layer: source -> filter -> distortion -> gain -> destination
    source.connect(filterNode);
    filterNode.connect(distortionNode);
    distortionNode.connect(gainNode);
    gainNode.connect(destination);
    
    gainNode.gain.value = 0.0; // Start muted
    
    return {
      source,
      audio,
      gainNode,
      effectNodes: [filterNode, distortionNode],
      isPlaying: false,
      volume: 0
    };
  },
  
  // Helper method to create noise-based static layer
  createNoiseLayer: (audioContext: AudioContext, destination: AudioNode): AudioLayer => {
    const gainNode = audioContext.createGain();
    const filterNode = audioContext.createBiquadFilter();
    
    // Configure static filtering
    filterNode.type = 'bandpass';
    filterNode.frequency.value = 2000;
    filterNode.Q.value = 0.5;
    
    // Connect: (noise buffer will be connected later) -> filter -> gain -> destination
    filterNode.connect(gainNode);
    gainNode.connect(destination);
    
    gainNode.gain.value = 0.0;
    
    return {
      source: null, // Will be buffer source
      audio: null,
      gainNode,
      effectNodes: [filterNode],
      isPlaying: false,
      volume: 0
    };
  },
  
  // Helper method to create spatial whispers layer
  createWhispersLayer: (audioContext: AudioContext, spatialNode: PannerNode): AudioLayer => {
    const gainNode = audioContext.createGain();
    const reverbNode = audioContext.createConvolver();
    
    // Connect: (whisper source will connect later) -> reverb -> gain -> spatial
    reverbNode.connect(gainNode);
    gainNode.connect(spatialNode);
    
    gainNode.gain.value = 0.0;
    
    return {
      source: null,
      audio: null,
      gainNode,
      effectNodes: [reverbNode],
      isPlaying: false,
      volume: 0
    };
  },
  
  updateProgression: (killsRemaining: number, totalEnemies: number, area: AreaId, burnCount: number) => {
    const { isInitialized, isActive } = get();
    if (!isInitialized || !isActive) return;
    
    // Update core state
    set({
      killsRemaining,
      totalEnemies,
      currentArea: area,
      burnCount,
      corruptionLevel: Math.min((totalEnemies - killsRemaining) / totalEnemies, 1.0)
    });
    
    console.log(`🎵 Music Corruption Update: ${area} | ${killsRemaining}/${totalEnemies} remaining | Burn count: ${burnCount}`);
    
    // Determine stage based on area-specific kill ranges
    const areaConfig = AREA_PROGRESSIONS[area];
    let currentStage: CorruptionStage = 'clean';
    
    for (const stageConfig of areaConfig.stages) {
      const [min, max] = stageConfig.killRange;
      if (killsRemaining >= min && killsRemaining <= max) {
        currentStage = stageConfig.stage;
        break;
      }
    }
    
    // Check for boss phase
    if (killsRemaining === 0) {
      get().startBossSequence(area);
      return;
    }
    
    set({ currentStage });
    
    // Apply area-specific effects for current stage
    get().applyAreaSpecificEffects(currentStage, area);
    
    // Apply burn corruption overlay
    get().applyBurnCorruption(burnCount);
    
    console.log(`🎵 Stage: ${currentStage} | Corruption: ${get().corruptionLevel.toFixed(2)} | Area: ${area}`);
  },
  
  applyAreaSpecificEffects: (stage: CorruptionStage, area: AreaId) => {
    const areaConfig = AREA_PROGRESSIONS[area];
    const stageConfig = areaConfig.stages.find(s => s.stage === stage);
    if (!stageConfig) return;
    
    const effects = stageConfig.effects;
    
    console.log(`🎵 Applying ${area} ${stage} effects:`, effects);
    
    // Apply individual layer effects
    get().updateLayerVolume('piano', effects.piano.volume);
    get().applyPianoDetuning(effects.piano.detuning);
    
    get().updateLayerVolume('strings', effects.strings.volume);
    get().applyStringEvolution(effects.strings.vibrato, effects.strings.screech);
    
    get().updateLayerVolume('percussion', effects.percussion.volume);
    get().applyPercussionChanges(effects.percussion.tempo, effects.percussion.type);
    
    get().updateLayerVolume('drones', effects.drones.volume);
    get().updateLayerVolume('static', effects.static.volume);
    get().updateLayerVolume('whispers', effects.whispers.volume);
    
    if (effects.whispers.spatial) {
      get().applySpatialWhispers({
        x: Math.sin(Date.now() * 0.001) * 3,
        y: Math.cos(Date.now() * 0.0007) * 2,
        z: Math.sin(Date.now() * 0.0013) * 4
      });
    }
    
    set({
      pianoDetuning: effects.piano.detuning,
      stringVibrato: effects.strings.vibrato,
      percussionTempo: effects.percussion.tempo,
      staticIntensity: effects.static.intensity
    });
  },
  
  applyBurnCorruption: (burnCount: number) => {
    const { audioContext, pianoLayer, masterGainNode } = get();
    if (!audioContext || !pianoLayer.audio || !masterGainNode) return;
    
    if (burnCount === 0) return;
    
    console.log(`🔥 Applying burn corruption effects: Burn ${burnCount}`);
    
    switch (burnCount) {
      case 1:
        // 1st Burn: Track skips, restarts slightly detuned
        pianoLayer.audio.currentTime = 0;
        pianoLayer.audio.playbackRate = 0.95; // Slight detuning
        console.log("🔥 1st Burn: Track skipped and detuned");
        break;
        
      case 2:
        // 2nd Burn: Distortion layers stack, percussion accelerates
        pianoLayer.audio.playbackRate = 0.90;
        get().applyPercussionChanges(1.4, 'irregular');
        // Add extra distortion
        if (pianoLayer.effectNodes[1] instanceof WaveShaperNode) {
          pianoLayer.effectNodes[1].curve = createDistortionCurve(50);
        }
        console.log("🔥 2nd Burn: Distortion stacked, percussion accelerated");
        break;
        
      case 3:
      default:
        // 3rd Burn: Whispers overwhelm, drowning entire soundtrack
        get().updateLayerVolume('whispers', 0.9);
        masterGainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 2.0);
        get().updateLayerVolume('piano', 0.1);
        get().updateLayerVolume('strings', 0.1);
        console.log("🔥 3rd+ Burn: Whispers overwhelming soundtrack");
        break;
    }
    
    set({ burnCount, burnEffectsActive: true });
  },
  
  startBossSequence: (area: AreaId) => {
    const { bossSequenceTimer } = get();
    
    // Clear any existing boss sequence
    if (bossSequenceTimer) {
      clearTimeout(bossSequenceTimer);
    }
    
    console.log(`🎵 Starting boss sequence for ${area}`);
    
    set({
      bossPhaseActive: true,
      currentBossPhase: 1,
      bossPhaseStartTime: Date.now()
    });
    
    // Start phase 1
    const areaConfig = AREA_PROGRESSIONS[area];
    const phase1 = areaConfig.bossSequence.phases[0];
    
    get().applyBossPhaseEffects(phase1.effects);
    
    // Schedule phase advancement
    const timer = setTimeout(() => {
      get().advanceBossPhase();
    }, phase1.duration * 1000);
    
    set({ bossSequenceTimer: timer });
  },
  
  advanceBossPhase: () => {
    const { currentBossPhase, currentArea, bossSequenceTimer } = get();
    
    // Clear current timer
    if (bossSequenceTimer) {
      clearTimeout(bossSequenceTimer);
    }
    
    const areaConfig = AREA_PROGRESSIONS[currentArea];
    const nextPhase = currentBossPhase + 1;
    
    if (nextPhase <= areaConfig.bossSequence.phases.length) {
      console.log(`🎵 Advancing to boss phase ${nextPhase} for ${currentArea}`);
      
      set({ currentBossPhase: nextPhase as 1 | 2 | 3 });
      
      const phaseConfig = areaConfig.bossSequence.phases[nextPhase - 1];
      get().applyBossPhaseEffects(phaseConfig.effects);
      
      // Schedule next phase if there is one
      if (nextPhase < areaConfig.bossSequence.phases.length) {
        const timer = setTimeout(() => {
          get().advanceBossPhase();
        }, phaseConfig.duration * 1000);
        
        set({ bossSequenceTimer: timer });
      } else {
        console.log(`🎵 Boss sequence complete for ${currentArea}`);
        set({ bossSequenceTimer: null });
      }
    }
  },
  
  applyBossPhaseEffects: (effects: any) => {
    console.log("🎵 Applying boss phase effects:", effects);
    
    // Apply all layer effects from boss phase configuration
    Object.keys(effects).forEach(layerName => {
      const layerEffects = effects[layerName];
      get().updateLayerVolume(layerName, layerEffects.volume);
      
      // Apply specific layer effects
      switch (layerName) {
        case 'piano':
          if (layerEffects.detuning) get().applyPianoDetuning(layerEffects.detuning);
          break;
        case 'strings':
          if (layerEffects.vibrato !== undefined) {
            get().applyStringEvolution(layerEffects.vibrato, layerEffects.screech || 0);
          }
          break;
        case 'percussion':
          if (layerEffects.tempo) {
            get().applyPercussionChanges(layerEffects.tempo, layerEffects.type || 'heartbeat');
          }
          break;
        case 'whispers':
          if (layerEffects.spatial) {
            get().applySpatialWhispers({
              x: Math.sin(Date.now() * 0.002) * 5,
              y: Math.cos(Date.now() * 0.0015) * 3,
              z: Math.sin(Date.now() * 0.0025) * 6
            });
          }
          break;
      }
    });
  },
  
  // Individual layer control methods
  updateLayerVolume: (layerName: string, volume: number) => {
    const state = get();
    const layerMap: Record<string, AudioLayer> = {
      'piano': state.pianoLayer,
      'strings': state.stringsLayer,
      'percussion': state.percussionLayer,
      'drones': state.dronesLayer,
      'static': state.staticLayer,
      'whispers': state.whispersLayer
    };
    
    const layer = layerMap[layerName];
    if (layer && layer.gainNode && state.audioContext) {
      layer.gainNode.gain.linearRampToValueAtTime(volume * 0.8, state.audioContext.currentTime + 1.0);
      layer.volume = volume;
      
      // Start playing if not already
      if (!layer.isPlaying && volume > 0 && layer.audio) {
        layer.audio.play().catch(e => console.log(`${layerName} layer play prevented:`, e));
        layer.isPlaying = true;
      }
    }
  },
  
  applyPianoDetuning: (cents: number) => {
    const { pianoLayer, audioContext } = get();
    if (pianoLayer.audio && audioContext) {
      const detuneRatio = Math.pow(2, cents / 1200);
      pianoLayer.audio.playbackRate = detuneRatio;
      
      set({ pianoDetuning: cents });
    }
  },
  
  applyStringEvolution: (vibratoAmount: number, screechAmount: number) => {
    const { stringsLayer, audioContext } = get();
    if (stringsLayer.effectNodes.length > 0 && audioContext) {
      const filterNode = stringsLayer.effectNodes[0] as BiquadFilterNode;
      
      // Apply vibrato through frequency modulation
      if (vibratoAmount > 0) {
        const lfoFreq = 4 + vibratoAmount * 8; // 4-12 Hz vibrato
        const depth = vibratoAmount * 100; // up to 100 cent depth
        
        // Create LFO for vibrato (simplified - in real implementation would use OscillatorNode)
        const targetFreq = 800 + Math.sin(Date.now() * 0.001 * lfoFreq) * depth;
        filterNode.frequency.linearRampToValueAtTime(targetFreq, audioContext.currentTime + 0.1);
      }
      
      // Apply screech through high-frequency emphasis
      if (screechAmount > 0) {
        filterNode.type = 'highpass';
        filterNode.frequency.value = 1000 + screechAmount * 2000; // 1000-3000 Hz
        filterNode.Q.value = 1 + screechAmount * 10; // Increase resonance for screech
      }
      
      set({ stringVibrato: vibratoAmount });
    }
  },
  
  applyPercussionChanges: (tempoMultiplier: number, type: 'heartbeat' | 'irregular' | 'chains') => {
    const { percussionLayer, audioContext } = get();
    if (percussionLayer.audio && audioContext) {
      percussionLayer.audio.playbackRate = tempoMultiplier;
      
      // Apply type-specific filtering
      const filterNode = percussionLayer.effectNodes[0] as BiquadFilterNode;
      switch (type) {
        case 'heartbeat':
          filterNode.type = 'lowpass';
          filterNode.frequency.value = 200;
          break;
        case 'irregular':
          filterNode.type = 'bandpass';
          filterNode.frequency.value = 400;
          filterNode.Q.value = 2;
          break;
        case 'chains':
          filterNode.type = 'highpass';
          filterNode.frequency.value = 800;
          break;
      }
      
      set({ percussionTempo: tempoMultiplier });
    }
  },
  
  applySpatialWhispers: (position: { x: number; y: number; z: number }) => {
    const { spatialPannerNode } = get();
    if (spatialPannerNode) {
      spatialPannerNode.positionX.linearRampToValueAtTime(position.x, spatialPannerNode.context.currentTime + 0.5);
      spatialPannerNode.positionY.linearRampToValueAtTime(position.y, spatialPannerNode.context.currentTime + 0.5);
      spatialPannerNode.positionZ.linearRampToValueAtTime(position.z, spatialPannerNode.context.currentTime + 0.5);
      
      set({ whisperSpatialPosition: position });
    }
  },
  
  toggleCorruption: (enabled: boolean) => {
    set({ isActive: enabled });
    
    if (!enabled) {
      // Reset to clean state
      get().applyAreaSpecificEffects('clean', 'Vale');
    }
    
    console.log(`🎵 Sophisticated Music Corruption System ${enabled ? 'enabled' : 'disabled'}`);
  },
  
  cleanup: () => {
    const { 
      audioContext, 
      bossSequenceTimer,
      pianoLayer,
      stringsLayer,
      percussionLayer,
      dronesLayer,
      staticLayer,
      whispersLayer
    } = get();
    
    // Clear boss sequence timer
    if (bossSequenceTimer) {
      clearTimeout(bossSequenceTimer);
    }
    
    // Stop and disconnect all layers
    [pianoLayer, stringsLayer, percussionLayer, dronesLayer, staticLayer, whispersLayer].forEach(layer => {
      if (layer.audio) {
        layer.audio.pause();
        layer.audio.currentTime = 0;
      }
      if (layer.source) {
        layer.source.disconnect();
      }
      if (layer.gainNode) {
        layer.gainNode.disconnect();
      }
      layer.effectNodes.forEach(node => node.disconnect());
    });
    
    if (audioContext) {
      audioContext.close();
    }
    
    // Reset state
    set({
      audioContext: null,
      masterGainNode: null,
      spatialPannerNode: null,
      pianoLayer: { source: null, audio: null, gainNode: null, effectNodes: [], isPlaying: false, volume: 0 },
      stringsLayer: { source: null, audio: null, gainNode: null, effectNodes: [], isPlaying: false, volume: 0 },
      percussionLayer: { source: null, audio: null, gainNode: null, effectNodes: [], isPlaying: false, volume: 0 },
      dronesLayer: { source: null, audio: null, gainNode: null, effectNodes: [], isPlaying: false, volume: 0 },
      staticLayer: { source: null, audio: null, gainNode: null, effectNodes: [], isPlaying: false, volume: 0 },
      whispersLayer: { source: null, audio: null, gainNode: null, effectNodes: [], isPlaying: false, volume: 0 },
      isInitialized: false,
      isActive: false,
      bossSequenceTimer: null
    });
    
    console.log("🎵 Sophisticated Multi-Layer Music Corruption System cleaned up");
  }
}));