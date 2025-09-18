import { useEffect, useState } from "react";
import { useGenocide } from "../lib/stores/useGenocide";

interface WhisperProps {
  id: string;
  text: string;
  intensity: number;
  timestamp: number;
  onRemove: (id: string) => void;
}

function Whisper({ id, text, intensity, timestamp, onRemove }: WhisperProps) {
  const [opacity, setOpacity] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Fade in
    const fadeInTimeout = setTimeout(() => setOpacity(1), 100);
    
    // Start fade out after 3 seconds
    const fadeOutTimeout = setTimeout(() => {
      setOpacity(0);
      // Remove after fade out completes
      setTimeout(() => {
        setIsVisible(false);
        onRemove(id);
      }, 500);
    }, 3000);

    return () => {
      clearTimeout(fadeInTimeout);
      clearTimeout(fadeOutTimeout);
    };
  }, [id, onRemove]);

  if (!isVisible) return null;

  // Different positions and styles based on intensity
  const getWhisperStyle = (intensity: number) => {
    const baseStyle = {
      position: 'fixed' as const,
      color: '#ff6b6b',
      fontFamily: 'Inter, monospace',
      fontSize: `${12 + intensity * 8}px`,
      fontWeight: intensity > 0.7 ? 'bold' : 'normal',
      textShadow: `0 0 ${intensity * 20}px rgba(255, 107, 107, 0.8)`,
      opacity,
      transition: 'opacity 0.5s ease-in-out',
      zIndex: 9999,
      pointerEvents: 'none' as const,
      textTransform: intensity > 0.8 ? 'uppercase' as const : 'none' as const,
      letterSpacing: intensity > 0.6 ? '2px' : '1px',
    };

    // Position whispers at different screen edges based on intensity
    if (intensity >= 0.8) {
      // High intensity - center screen
      return {
        ...baseStyle,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '24px',
        color: '#d63031',
        animation: 'whisperPulse 0.5s ease-in-out infinite alternate',
      };
    } else if (intensity >= 0.6) {
      // Mid-high intensity - top right
      return {
        ...baseStyle,
        top: '100px',
        right: '50px',
        fontSize: '18px',
      };
    } else if (intensity >= 0.3) {
      // Mid intensity - left side
      return {
        ...baseStyle,
        top: '40%',
        left: '30px',
        fontSize: '16px',
      };
    } else {
      // Low intensity - bottom right
      return {
        ...baseStyle,
        bottom: '150px',
        right: '100px',
        fontSize: '14px',
        color: '#e17055',
      };
    }
  };

  return (
    <div style={getWhisperStyle(intensity)}>
      {text}
    </div>
  );
}

export default function WhisperDisplay() {
  const { activeWhispers, removeWhisper } = useGenocide();

  return (
    <>
      <style>{`
        @keyframes whisperPulse {
          0% { transform: translate(-50%, -50%) scale(1); }
          100% { transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
      
      {activeWhispers.map((whisper) => (
        <Whisper
          key={whisper.id}
          id={whisper.id}
          text={whisper.text}
          intensity={whisper.intensity}
          timestamp={whisper.timestamp}
          onRemove={removeWhisper}
        />
      ))}
    </>
  );
}