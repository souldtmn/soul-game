import { usePlayer } from "../lib/stores/usePlayer";
import { useSouls } from "../lib/stores/useSouls";
import { useCombat } from "../lib/stores/useCombat";
import MonsterCountdown from "./MonsterCountdown";

export default function HUD() {
  const { health, maxHealth } = usePlayer();
  const { totalSouls, soulCount } = useSouls();
  const { isPlayerAttacking, attackTimer } = useCombat();

  return (
    <>
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
      {/* Health Bar */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #fff',
        borderRadius: '8px',
        padding: '10px',
        marginBottom: '10px',
        color: '#fff',
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
        border: '2px solid #e17055',
        borderRadius: '8px',
        padding: '10px',
        marginBottom: '10px',
        color: '#fff',
      }}>
        <div style={{ fontSize: '14px', marginBottom: '5px' }}>SOULS</div>
        <div style={{ fontSize: '18px', color: '#e17055', fontWeight: 'bold' }}>
          {soulCount} (Total: {totalSouls})
        </div>
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
