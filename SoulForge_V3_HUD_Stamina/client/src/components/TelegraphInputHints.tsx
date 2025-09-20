import { useTelegraph } from "../lib/stores/useTelegraph";

export default function TelegraphInputHints() {
  const { showInputHints, successfulInteractions } = useTelegraph();
  
  if (!showInputHints) {
    return null;
  }
  
  // Fade out as player gets more successful
  const opacity = Math.max(0.3, 1.0 - (successfulInteractions * 0.2));
  
  return (
    <div
      style={{ 
        pointerEvents: 'none',
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '12px 20px',
          borderRadius: '8px',
          border: '1px solid #666a70',
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#d0d7de',
          textAlign: 'center',
          opacity: opacity,
          transition: 'opacity 0.5s ease',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <span style={{ color: '#ffc66d' }}>
            🏃 Evade: <span style={{ color: '#9be9a8' }}>A ←</span> / <span style={{ color: '#9be9a8' }}>D →</span>
          </span>
          <span style={{ color: '#666a70' }}>|</span>
          <span style={{ color: '#79c0ff' }}>
            🛡️ Defend: <span style={{ color: '#9be9a8' }}>K</span> / <span style={{ color: '#9be9a8' }}>Shift</span>
          </span>
          <span style={{ color: '#666a70' }}>|</span>
          <span style={{ color: '#ff6b6b' }}>
            ⚔️ Attack: <span style={{ color: '#9be9a8' }}>J</span> / <span style={{ color: '#9be9a8' }}>Space</span>
          </span>
        </div>
        
        {successfulInteractions > 0 && (
          <div style={{ 
            marginTop: '6px', 
            fontSize: '12px', 
            color: '#9aa0a6',
            opacity: 0.7
          }}>
            Progress: {successfulInteractions}/3 successful actions
          </div>
        )}
      </div>
    </div>
  );
}