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
  const { killCount, totalEnemiesRequired, currentThreshold, uiCorruptionLevel, genocideComplete, ash, dust, corruption, area } = useGenocide();

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

      {/* SOUL System Display - Watcher's Format: Area: Vale | Left: 3 | Ash: 150 | Dust: 47 | Corruption: 0 */}
      <div style={{
        backgroundColor: `rgba(0, 0, 0, ${0.85 + uiCorruptionLevel * 0.15})`,
        border: getCorruptedBorder('3px solid #e17055', uiCorruptionLevel),
        borderRadius: '12px',
        padding: '15px',
        marginBottom: '10px',
        color: '#fff',
        filter: uiCorruptionLevel > 0.5 ? `hue-rotate(${uiCorruptionLevel * 60}deg)` : 'none',
        transform: genocideComplete ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.3s ease',
        boxShadow: uiCorruptionLevel > 0.7 ? '0 0 30px rgba(225, 112, 85, 0.4)' : '0 0 15px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{ 
          fontSize: '16px', 
          marginBottom: '8px',
          color: getCorruptedStyle('#e17055', uiCorruptionLevel),
          fontWeight: 'bold',
          textTransform: uiCorruptionLevel > 0.8 ? 'uppercase' : 'none',
          letterSpacing: uiCorruptionLevel > 0.6 ? '3px' : '2px',
        }}>
          {genocideComplete ? 'GENOCIDE COMPLETE' : 'SOUL PROGRESSION'}
        </div>
        
        {/* The Watcher's Format */}
        <div style={{ 
          fontSize: '18px', 
          color: getCorruptedStyle('#fff', uiCorruptionLevel), 
          fontWeight: 'bold',
          textShadow: uiCorruptionLevel > 0.7 ? '0 0 10px rgba(225, 112, 85, 0.6)' : 'none',
          fontFamily: 'monospace',
          letterSpacing: '1px',
          lineHeight: '1.2',
        }}>
          Area: {area} | Left: {killCount} | Ash: {ash} | Dust: {dust} | Corruption: {corruption}
        </div>
        
        {currentThreshold !== 'baseline' && (
          <div style={{ 
            fontSize: '13px', 
            marginTop: '8px', 
            color: getCorruptedStyle('#ccc', uiCorruptionLevel),
            fontStyle: 'italic',
            textAlign: 'center',
            opacity: 0.9,
          }}>
            {currentThreshold === 'early' && 'The descent begins...'}
            {currentThreshold === 'mid' && 'Deeper into darkness...'}
            {currentThreshold === 'late' && 'At the threshold of void...'}
            {currentThreshold === 'complete' && 'THE VOID CONSUMES ALL'}
          </div>
        )}
      </div>
      
      {/* Soul Fragment Counter (Legacy) */}
      {soulCount > 0 && (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          border: getCorruptedBorder('2px solid #74b9ff', uiCorruptionLevel),
          borderRadius: '8px',
          padding: '8px',
          marginBottom: '10px',
          color: '#fff',
          opacity: 0.8,
        }}>
          <div style={{ fontSize: '12px', marginBottom: '3px' }}>SOUL FRAGMENTS</div>
          <div style={{ fontSize: '14px', color: getCorruptedStyle('#74b9ff', uiCorruptionLevel), fontWeight: 'bold' }}>
            {soulCount} collected (Total: {totalSouls})
          </div>
          <div style={{ fontSize: '10px', marginTop: '2px', color: '#999', fontStyle: 'italic' }}>
            Remnants of the fallen
          </div>
        </div>
      )}


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
