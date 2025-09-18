import { Html } from "@react-three/drei";
import { useTelegraph } from "../lib/stores/useTelegraph";
import { usePlayer } from "../lib/stores/usePlayer";

export default function TelegraphEvadeArrows() {
  const { 
    showEvadeArrows, 
    direction, 
    phase,
    isDodgingLeft,
    isDodgingRight 
  } = useTelegraph();
  const { position: playerPosition } = usePlayer();
  
  if (!showEvadeArrows || phase === 'idle') {
    return null;
  }
  
  const isFlashing = phase === 'imminent';
  const flashOpacity = isFlashing ? (Math.sin(Date.now() * 0.03) * 0.4 + 0.6) : 1.0;
  
  // Calculate arrow opacity based on direction hint and player input
  const getArrowOpacity = (arrowDirection: 'left' | 'right') => {
    const baseOpacity = direction ? (direction === arrowDirection ? 1.0 : 0.4) : 0.8;
    const isPressed = arrowDirection === 'left' ? isDodgingLeft : isDodgingRight;
    const pressedBoost = isPressed ? 0.3 : 0;
    return Math.min(1.0, (baseOpacity + pressedBoost) * flashOpacity);
  };
  
  const getArrowColor = (arrowDirection: 'left' | 'right') => {
    const isPressed = arrowDirection === 'left' ? isDodgingLeft : isDodgingRight;
    if (isPressed) return '#4ecdc4'; // Cyan when pressed
    if (direction && direction === arrowDirection) return '#9be9a8'; // Green for correct direction
    return '#d0d7de'; // Default gray
  };
  
  return (
    <Html
      center
      transform={false}
      style={{ 
        pointerEvents: 'none',
        position: 'fixed',
        top: '40%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 900,
      }}
    >
      <div 
        className="evade-arrows"
        style={{
          display: 'flex',
          gap: '80px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Left Arrow */}
        <div
          style={{
            opacity: getArrowOpacity('left'),
            color: getArrowColor('left'),
            fontSize: '28px',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            transform: isDodgingLeft ? 'scale(1.3)' : 'scale(1)',
            transition: 'transform 0.1s ease, opacity 0.1s ease',
            filter: phase === 'imminent' ? 'drop-shadow(0 0 6px currentColor)' : 'none',
          }}
        >
          ← A
        </div>
        
        {/* Right Arrow */}
        <div
          style={{
            opacity: getArrowOpacity('right'),
            color: getArrowColor('right'),
            fontSize: '28px',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            transform: isDodgingRight ? 'scale(1.3)' : 'scale(1)',
            transition: 'transform 0.1s ease, opacity 0.1s ease',
            filter: phase === 'imminent' ? 'drop-shadow(0 0 6px currentColor)' : 'none',
          }}
        >
          D →
        </div>
      </div>
      
      {/* Direction Hint */}
      {direction && (
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#ffc66d',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
            opacity: flashOpacity,
          }}
        >
          Evade {direction.toUpperCase()}!
        </div>
      )}
    </Html>
  );
}