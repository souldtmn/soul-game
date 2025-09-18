import { usePlayer } from "../lib/stores/usePlayer";
import { useSouls } from "../lib/stores/useSouls";
import { useCombat } from "../lib/stores/useCombat";
import { useGenocide } from "../lib/stores/useGenocide";
import MonsterCountdown from "./MonsterCountdown";
import WhisperDisplay from "./WhisperDisplay";

export default function HUD() {
  const { health, maxHealth } = usePlayer();
  const { totalSouls, soulCount } = useSouls();
  const { isPlayerAttacking, attackTimer } = useCombat();
  const { killCount, totalEnemiesRequired, currentThreshold, uiCorruptionLevel, genocideComplete } = useGenocide();

  // Apply corruption effects to UI elements
  const getCorruptedStyle = (baseColor: string, corruption: number) => {
    if (corruption < 0.3) return baseColor;
    if (corruption < 0.6) return '#ff6b6b'; // Light red tint
    if (corruption < 0.8) return '#d63031'; // Medium red
    return '#a29bfe'; // Purple corruption at high levels
  };

  const getCorruptedBorder = (baseBorder: string, corruption: number) => {
    if (corruption < 0.4) return baseBorder;
    if (corruption < 0.7) return '2px solid #ff6b6b';
    return `2px solid #d63031`;
  };

  return (
    <>
      {/* Whisper Display System */}
      <WhisperDisplay />
      
      {/* Monster Countdown - Top Right Corner */}
      <MonsterCountdown />
      
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        zIndex: 1000,
        pointerEvents: 'none',
        fontFamily: 'Inter, sans-serif',
      }}>
      {/* Health Bar - with corruption effects */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: getCorruptedBorder('2px solid #fff', uiCorruptionLevel),
        borderRadius: '8px',
        padding: '10px',
        marginBottom: '10px',
        color: uiCorruptionLevel > 0.7 ? '#ffb3b3' : '#fff',
      }}>
        <div style={{ fontSize: '14px', marginBottom: '5px' }}>HEALTH</div>
        <div style={{
          width: '200px',
          height: '20px',
          backgroundColor: '#333',
          border: '1px solid #fff',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${(health / maxHealth) * 100}%`,
            height: '100%',
            backgroundColor: health > 30 ? '#00ff00' : '#ff0000',
            transition: 'width 0.3s ease',
          }} />
        </div>
        <div style={{ fontSize: '12px', marginTop: '2px' }}>
          {health} / {maxHealth}
        </div>
      </div>

      {/* Soul Counter */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: getCorruptedBorder('2px solid #e17055', uiCorruptionLevel),
        borderRadius: '8px',
        padding: '10px',
        marginBottom: '10px',
        color: '#fff',
        filter: uiCorruptionLevel > 0.5 ? `hue-rotate(${uiCorruptionLevel * 45}deg)` : 'none',
      }}>
        <div style={{ fontSize: '14px', marginBottom: '5px' }}>SOULS</div>
        <div style={{ fontSize: '18px', color: getCorruptedStyle('#e17055', uiCorruptionLevel), fontWeight: 'bold' }}>
          {soulCount} (Total: {totalSouls})
        </div>
      </div>

      {/* Kill Counter - Genocide Progress */}
      <div style={{
        backgroundColor: `rgba(0, 0, 0, ${0.8 + uiCorruptionLevel * 0.2})`,
        border: getCorruptedBorder('2px solid #6c757d', uiCorruptionLevel),
        borderRadius: '8px',
        padding: '10px',
        marginBottom: '10px',
        color: uiCorruptionLevel > 0.6 ? '#ff6b6b' : '#fff',
        opacity: killCount > 0 ? 1 : 0.3, // Subtle until kills start
        transform: genocideComplete ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ 
          fontSize: '14px', 
          marginBottom: '5px',
          textTransform: uiCorruptionLevel > 0.8 ? 'uppercase' : 'none',
          letterSpacing: uiCorruptionLevel > 0.6 ? '2px' : '1px',
        }}>
          {genocideComplete ? 'GENOCIDE COMPLETE' : 'ELIMINATION PROGRESS'}
        </div>
        <div style={{ 
          fontSize: '18px', 
          color: getCorruptedStyle('#6c757d', uiCorruptionLevel), 
          fontWeight: uiCorruptionLevel > 0.5 ? 'bold' : 'normal',
          textShadow: uiCorruptionLevel > 0.7 ? '0 0 10px rgba(255, 107, 107, 0.5)' : 'none',
        }}>
          {killCount} / {totalEnemiesRequired}
        </div>
        {currentThreshold !== 'baseline' && (
          <div style={{ 
            fontSize: '12px', 
            marginTop: '5px', 
            color: getCorruptedStyle('#999', uiCorruptionLevel),
            fontStyle: 'italic',
          }}>
            {currentThreshold === 'early' && 'The hunt begins...'}
            {currentThreshold === 'mid' && 'Growing stronger...'}
            {currentThreshold === 'late' && 'Nearly complete...'}
            {currentThreshold === 'complete' && 'IT IS FINISHED'}
          </div>
        )}
      </div>

      {/* Attack Indicator */}
      {isPlayerAttacking && (
        <div style={{
          backgroundColor: 'rgba(76, 205, 196, 0.9)',
          border: '2px solid #4ecdc4',
          borderRadius: '8px',
          padding: '8px',
          marginBottom: '10px',
          color: '#fff',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            ATTACKING!
          </div>
          <div style={{ fontSize: '12px' }}>
            {attackTimer.toFixed(1)}s
          </div>
        </div>
      )}

      {/* Controls Help */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid #fff',
        borderRadius: '8px',
        padding: '10px',
        color: '#fff',
        fontSize: '12px',
      }}>
        <div><strong>Controls:</strong></div>
        <div>WASD / Arrow Keys - Move</div>
        <div>Space / J - Attack</div>
        <div>K / Shift - Defend</div>
        <div>E / Enter - Interact</div>
      </div>
    </div>
    </>
  );
}
