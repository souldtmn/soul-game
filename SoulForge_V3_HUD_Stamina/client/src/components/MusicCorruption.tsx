import { useEffect, useRef } from "react";
import { useMusicCorruption } from "../lib/stores/useMusicCorruption";
import { useGenocide } from "../lib/stores/useGenocide";
import { useAudio } from "../lib/stores/useAudio";
import type { AreaId } from "../lib/stores/useMusicCorruption";

export default function MusicCorruption() {
  const { 
    initializeMultiLayerSystem, 
    updateProgression, 
    toggleCorruption, 
    cleanup,
    isInitialized,
    isActive,
    currentStage,
    currentArea,
    corruptionLevel,
    burnCount: musicBurnCount,
    bossPhaseActive,
    currentBossPhase,
    pianoDetuning,
    stringVibrato,
    percussionTempo,
    staticIntensity
  } = useMusicCorruption();
  
  const { 
    killCount, 
    totalEnemiesRequired, 
    area, 
    currentThreshold,
    corruption // This represents burn/death count
  } = useGenocide();
  
  const { backgroundMusic, isMuted } = useAudio();
  
  const initializationAttempted = useRef(false);
  const lastKillCount = useRef(killCount);
  const lastArea = useRef(area);
  const lastCorruption = useRef(corruption);

  // Initialize the sophisticated multi-layer corruption system
  useEffect(() => {
    if (backgroundMusic && !isInitialized && !initializationAttempted.current) {
      initializationAttempted.current = true;
      
      console.log("🎵 Sophisticated MusicCorruption: Initializing multi-layer system with background music");
      
      // Small delay to ensure background music is ready
      setTimeout(() => {
        initializeMultiLayerSystem(backgroundMusic);
      }, 1000);
    }
  }, [backgroundMusic, isInitialized, initializeMultiLayerSystem]);

  // Handle mute state changes
  useEffect(() => {
    if (isInitialized) {
      toggleCorruption(!isMuted);
      console.log(`🎵 Sophisticated MusicCorruption: ${isMuted ? 'Disabled' : 'Enabled'} due to mute state`);
    }
  }, [isMuted, isInitialized, toggleCorruption]);

  // Update sophisticated music progression based on genocide progress and burn count
  useEffect(() => {
    if (isInitialized && isActive) {
      // Only update if kill count, area, or burn count changed
      if (lastKillCount.current !== killCount || 
          lastArea.current !== area || 
          lastCorruption.current !== corruption) {
        
        console.log(`🎵 Sophisticated MusicCorruption: Updating progression`);
        console.log(`🎵 Area: ${area} | Enemies remaining: ${killCount}/${totalEnemiesRequired} | Burn count: ${corruption}`);
        
        // Map area to AreaId type and call sophisticated progression system
        updateProgression(killCount, totalEnemiesRequired, area as AreaId, corruption);
        
        // Update refs
        lastKillCount.current = killCount;
        lastArea.current = area;
        lastCorruption.current = corruption;
      }
    }
  }, [killCount, totalEnemiesRequired, area, corruption, isInitialized, isActive, updateProgression]);

  // Enhanced corruption state logging for debugging
  useEffect(() => {
    if (isInitialized) {
      console.log(`🎵 Sophisticated MusicCorruption State Update:`);
      console.log(`  • Stage: ${currentStage} | Area: ${currentArea} | Corruption Level: ${corruptionLevel.toFixed(2)}`);
      console.log(`  • Boss Phase: ${bossPhaseActive ? `Active (Phase ${currentBossPhase})` : 'Inactive'}`);
      console.log(`  • Audio Effects: Piano detune ${pianoDetuning} cents | String vibrato ${stringVibrato.toFixed(2)} | Percussion tempo ${percussionTempo.toFixed(2)}x`);
      console.log(`  • Static intensity: ${staticIntensity.toFixed(2)} | Music burn count: ${musicBurnCount}`);
    }
  }, [currentStage, currentArea, corruptionLevel, bossPhaseActive, currentBossPhase, 
      pianoDetuning, stringVibrato, percussionTempo, staticIntensity, musicBurnCount, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInitialized) {
        console.log("🎵 Sophisticated MusicCorruption: Cleaning up multi-layer system on unmount");
        cleanup();
      }
    };
  }, [isInitialized, cleanup]);

  // Enhanced visual debug overlay for sophisticated system
  const showDebug = process.env.NODE_ENV === 'development';

  return (
    <>
      {showDebug && isInitialized && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: '#fff',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '11px',
          zIndex: 10000,
          fontFamily: 'monospace',
          border: '1px solid #666',
          minWidth: '280px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#ff6b6b' }}>
            🎵 Sophisticated Music Corruption System
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px' }}>
            <div><strong>Stage:</strong> {currentStage}</div>
            <div><strong>Area:</strong> {currentArea}</div>
            <div><strong>Corruption:</strong> {corruptionLevel.toFixed(3)}</div>
            <div><strong>Burns:</strong> {musicBurnCount}/3</div>
            <div><strong>Enemies:</strong> {killCount}/{totalEnemiesRequired}</div>
            <div><strong>Threshold:</strong> {currentThreshold}</div>
            <div><strong>Boss Phase:</strong> {bossPhaseActive ? `P${currentBossPhase}` : 'Off'}</div>
            <div><strong>Active:</strong> {isActive ? '✅' : '❌'}</div>
          </div>
          
          <div style={{ marginTop: '8px', borderTop: '1px solid #333', paddingTop: '6px' }}>
            <div style={{ fontSize: '9px', color: '#ddd', marginBottom: '4px' }}>
              <strong>Audio Effects:</strong>
            </div>
            <div style={{ fontSize: '9px', color: '#aaa' }}>
              Piano: {pianoDetuning}¢ | Strings: {stringVibrato.toFixed(2)} | 
              Perc: {percussionTempo.toFixed(2)}x | Static: {staticIntensity.toFixed(2)}
            </div>
          </div>
          
          <div style={{ marginTop: '6px', fontSize: '9px', color: '#888' }}>
            🔇 Muted: {isMuted ? 'Yes' : 'No'} | 🎛️ Multi-layer: Active
          </div>
        </div>
      )}
    </>
  );
}