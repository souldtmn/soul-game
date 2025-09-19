import { create } from "zustand";

export type TelegraphDirection = 'left' | 'right' | null;
export type TelegraphPhase = 'idle' | 'winding_up' | 'imminent' | 'impact' | 'resolving';

interface TelegraphState {
  // Core telegraph state
  phase: TelegraphPhase;
  windupProgress: number; // 0 to 1
  windupDuration: number; // in seconds (0.6 - 1.2s)
  direction: TelegraphDirection;
  enemyId: string | null;
  
  // Timing windows
  evadeWindow: number; // frames for successful evade (±4 frames ≈ 67ms at 60fps)
  impactFrame: number;
  currentFrame: number;
  
  // Player input state
  isDefending: boolean;
  isDodgingLeft: boolean;
  isDodgingRight: boolean;
  lastEvadeTime: number;
  
  // UI feedback state
  showWindupBar: boolean;
  showEvadeArrows: boolean;
  showDefendRing: boolean;
  showSuccessToast: boolean;
  successMessage: string;
  successColor: string;
  showInputHints: boolean;
  successfulInteractions: number;
  
  // Phase 3: Impact Feedback state
  hitstopActive: boolean;
  hitstopDuration: number; // in milliseconds
  hitstopEndTime: number;
  cameraShakeActive: boolean;
  cameraShakeIntensity: number;
  cameraShakeEndTime: number;
  lastImpactType: 'block' | 'evade' | 'hit' | null;
  
  // Actions
  startWindup: (enemyId: string, duration?: number, direction?: TelegraphDirection) => void;
  updateWindup: (deltaTime: number) => void;
  triggerImminent: () => void;
  resolveImpact: () => { evaded: boolean; guarded: boolean; damage: number; blockReduction: number; timingQuality: string; perfectEvade: boolean; perfectBlock: boolean };
  endTelegraph: () => void;
  
  // Input actions
  setDefending: (defending: boolean) => void;
  attemptEvade: (direction: 'left' | 'right') => void;
  
  // UI actions
  showToast: (message: string, color?: string) => void;
  hideToast: () => void;
  incrementSuccessfulInteraction: () => void;
  
  // Phase 3: Impact Feedback actions
  triggerHitstop: (duration: number) => void;
  triggerCameraShake: (intensity: number, duration: number) => void;
  updateEffects: (deltaTime: number) => void;
}

export const useTelegraph = create<TelegraphState>((set, get) => ({
  // Initial state
  phase: 'idle',
  windupProgress: 0,
  windupDuration: 0.8, // default 800ms
  direction: null,
  enemyId: null,
  
  // Timing
  evadeWindow: 4, // ±4 frames
  impactFrame: 0,
  currentFrame: 0,
  
  // Input state
  isDefending: false,
  isDodgingLeft: false,
  isDodgingRight: false,
  lastEvadeTime: 0,
  
  // UI state
  showWindupBar: false,
  showEvadeArrows: false,
  showDefendRing: false,
  showSuccessToast: false,
  successMessage: '',
  successColor: '#9be9a8',
  showInputHints: true,
  successfulInteractions: 0,
  
  // Phase 3: Impact Feedback initial state
  hitstopActive: false,
  hitstopDuration: 0,
  hitstopEndTime: 0,
  cameraShakeActive: false,
  cameraShakeIntensity: 0,
  cameraShakeEndTime: 0,
  lastImpactType: null,
  
  // Core actions
  startWindup: (enemyId: string, duration = 0.8, direction = null) => {
    const variableDuration = duration + (Math.random() * 0.4 - 0.2); // ±200ms variance
    console.log(`⚡ Telegraph started: Enemy ${enemyId}, ${variableDuration.toFixed(2)}s wind-up, direction: ${direction || 'any'}`);
    
    set({
      phase: 'winding_up',
      windupProgress: 0,
      windupDuration: variableDuration,
      direction,
      enemyId,
      showWindupBar: true,
      showEvadeArrows: true,
      currentFrame: 0,
      impactFrame: Math.floor(variableDuration * 60), // convert to frames (60fps)
      isDodgingLeft: false,
      isDodgingRight: false,
    });
  },
  
  updateWindup: (deltaTime: number) => {
    const state = get();
    // Allow updates during both winding_up and imminent phases
    if (state.phase !== 'winding_up' && state.phase !== 'imminent') return;
    
    const newProgress = state.windupProgress + (deltaTime / state.windupDuration);
    const newFrame = state.currentFrame + 1;
    
    set({
      windupProgress: Math.min(1, newProgress),
      currentFrame: newFrame,
    });
    
    // Trigger imminent phase at 80% progress (but keep updating)
    if (newProgress >= 0.8 && state.phase === 'winding_up') {
      get().triggerImminent();
    }
    
    // Auto-trigger impact when progress reaches 100%
    if (newProgress >= 1.0) {
      console.log('💥 Telegraph impact triggered!');
      set({ phase: 'impact' });
      // Auto-resolve immediately
      setTimeout(() => {
        if (get().phase === 'impact') {
          get().resolveImpact();
        }
      }, 30); // Faster resolution
    }
  },
  
  triggerImminent: () => {
    console.log('⚠️ Telegraph imminent - danger flash!');
    set({ 
      phase: 'imminent',
      successMessage: '',
      showSuccessToast: false 
    });
  },
  
  resolveImpact: () => {
    const state = get();
    console.log('💥 Telegraph impact - resolving evade/defend...');
    
    // Enhanced timing calculation for skill-based mechanics
    const frameDiff = Math.abs(state.currentFrame - state.impactFrame);
    const perfectWindow = 2; // ±2 frames for perfect timing (33ms at 60fps)
    const goodWindow = state.evadeWindow; // ±4 frames for good timing (67ms)
    
    const isPerfectTiming = frameDiff <= perfectWindow;
    const isGoodTiming = frameDiff <= goodWindow;
    
    // Enhanced evade detection
    const isEvadeInput = state.isDodgingLeft || state.isDodgingRight;
    const correctDirection = state.direction === null || 
      (state.direction === 'left' && state.isDodgingLeft) ||
      (state.direction === 'right' && state.isDodgingRight);
    
    const finalEvaded = isEvadeInput && isGoodTiming && correctDirection;
    const perfectEvade = isEvadeInput && isPerfectTiming && correctDirection;
    
    // Enhanced block detection with timing-based effectiveness
    const isBlockInput = state.isDefending;
    let blockReduction = 0;
    let blockQuality = '';
    
    if (isBlockInput) {
      if (isPerfectTiming) {
        blockReduction = 0.8; // 80% damage reduction for perfect block
        blockQuality = 'PERFECT';
        get().showToast('Perfect Block!', '#ffd700');
        get().triggerHitstop(200); // 200ms hitstop for perfect block
        get().triggerCameraShake(1.2, 250); // Strong shake for perfect block
        set({ lastImpactType: 'block' });
      } else if (isGoodTiming) {
        blockReduction = 0.6; // 60% damage reduction for good block  
        blockQuality = 'GOOD';
        get().showToast('Good Block!', '#79c0ff');
        get().triggerHitstop(120); // 120ms hitstop for good block
        get().triggerCameraShake(0.7, 180); // Medium shake for good block
        set({ lastImpactType: 'block' });
      } else {
        blockReduction = 0.4; // 40% damage reduction for late block
        blockQuality = 'LATE';
        get().showToast('Late Block', '#ff9f40');
        get().triggerHitstop(60); // 60ms hitstop for late block
        get().triggerCameraShake(0.3, 120); // Light shake for late block
        set({ lastImpactType: 'block' });
      }
      get().incrementSuccessfulInteraction();
    }
    
    // Skill-based feedback messages with impact effects
    if (finalEvaded) {
      if (perfectEvade) {
        get().showToast('Perfect Evade!', '#9be9a8');
        get().triggerHitstop(150); // 150ms hitstop for perfect evade
        get().triggerCameraShake(0.8, 200); // Medium shake for perfect evade
        set({ lastImpactType: 'evade' });
      } else {
        get().showToast('Good Evade!', '#7dd3fc');
        get().triggerHitstop(100); // 100ms hitstop for good evade
        get().triggerCameraShake(0.5, 150); // Light shake for good evade
        set({ lastImpactType: 'evade' });
      }
      get().incrementSuccessfulInteraction();
    }
    
    // Add hit feedback for plain hits (no block/evade)
    if (!finalEvaded && !isBlockInput) {
      get().triggerHitstop(40); // Brief hitstop for hits
      get().triggerCameraShake(0.4, 120); // Mild shake for hits
      set({ lastImpactType: 'hit' });
    }

    // Enhanced result logging with timing details
    const timingInfo = isPerfectTiming ? 'PERFECT' : isGoodTiming ? 'GOOD' : 'LATE';
    console.log(`🎯 Impact resolved: evaded=${finalEvaded}, blocked=${isBlockInput}, timing=${timingInfo}, blockReduction=${blockReduction.toFixed(1)}`);
    console.log(`⏱️ Frame timing: ${frameDiff}f diff (perfect≤${perfectWindow}f, good≤${goodWindow}f)`);
    
    set({ 
      phase: 'resolving',
      showWindupBar: false,
      showEvadeArrows: false,
    });
    
    // Auto-end after resolution
    setTimeout(() => get().endTelegraph(), 300);
    
    // Return enhanced result data for DamageResolver
    return { 
      evaded: finalEvaded, 
      guarded: isBlockInput,
      blockReduction,
      timingQuality: timingInfo,
      perfectEvade,
      perfectBlock: isBlockInput && isPerfectTiming,
      damage: 10 // Legacy field, actual damage calculated by DamageResolver
    };
  },
  
  endTelegraph: () => {
    console.log('🏁 Telegraph ended');
    set({
      phase: 'idle',
      windupProgress: 0,
      direction: null,
      enemyId: null,
      showWindupBar: false,
      showEvadeArrows: false,
      isDodgingLeft: false,
      isDodgingRight: false,
      currentFrame: 0,
      impactFrame: 0,
    });
  },
  
  // Input actions
  setDefending: (defending: boolean) => {
    set({ 
      isDefending: defending,
      showDefendRing: defending 
    });
  },
  
  attemptEvade: (direction: 'left' | 'right') => {
    const state = get();
    console.log(`🏃 Player attempts ${direction} evade (frame ${state.currentFrame}/${state.impactFrame})`);
    
    set({
      isDodgingLeft: direction === 'left',
      isDodgingRight: direction === 'right',
      lastEvadeTime: Date.now(),
    });
    
    // Clear dodge state after short window (120ms)
    setTimeout(() => {
      const currentState = get();
      if (Date.now() - currentState.lastEvadeTime >= 120) {
        set({
          isDodgingLeft: false,
          isDodgingRight: false,
        });
      }
    }, 120);
  },
  
  // UI actions
  showToast: (message: string, color = '#9be9a8') => {
    set({
      showSuccessToast: true,
      successMessage: message,
      successColor: color,
    });
    
    // Auto-hide after 500ms
    setTimeout(() => get().hideToast(), 500);
  },
  
  hideToast: () => {
    set({
      showSuccessToast: false,
      successMessage: '',
    });
  },
  
  incrementSuccessfulInteraction: () => {
    const newCount = get().successfulInteractions + 1;
    set({ successfulInteractions: newCount });
    
    // Hide input hints after 3 successful interactions
    if (newCount >= 3) {
      set({ showInputHints: false });
    }
  },
  
  // Phase 3: Impact Feedback implementations
  triggerHitstop: (duration: number) => {
    const currentTime = Date.now();
    console.log(`⏸️ Hitstop triggered: ${duration}ms`);
    set({
      hitstopActive: true,
      hitstopDuration: duration,
      hitstopEndTime: currentTime + duration,
    });
  },
  
  triggerCameraShake: (intensity: number, duration: number) => {
    const currentTime = Date.now();
    console.log(`📹 Camera shake triggered: intensity ${intensity.toFixed(2)}, ${duration}ms`);
    set({
      cameraShakeActive: true,
      cameraShakeIntensity: intensity,
      cameraShakeEndTime: currentTime + duration,
    });
  },
  
  updateEffects: (deltaTime: number) => {
    const state = get();
    const currentTime = Date.now();
    
    // Update hitstop
    if (state.hitstopActive && currentTime >= state.hitstopEndTime) {
      console.log(`⏸️ Hitstop ended`);
      set({ hitstopActive: false, hitstopDuration: 0, hitstopEndTime: 0 });
    }
    
    // Update camera shake
    if (state.cameraShakeActive && currentTime >= state.cameraShakeEndTime) {
      console.log(`📹 Camera shake ended`);
      set({ 
        cameraShakeActive: false, 
        cameraShakeIntensity: 0, 
        cameraShakeEndTime: 0 
      });
    }
  },
}));