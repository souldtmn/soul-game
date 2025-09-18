import { useEffect, useState } from "react";
import { Html } from "@react-three/drei";
import { useTelegraph } from "../lib/stores/useTelegraph";
import { usePlayer } from "../lib/stores/usePlayer";

export default function TelegraphSuccessToast() {
  const { 
    showSuccessToast, 
    successMessage, 
    successColor 
  } = useTelegraph();
  const { position: playerPosition } = usePlayer();
  
  const [localShow, setLocalShow] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'stay' | 'exit'>('enter');
  
  useEffect(() => {
    if (showSuccessToast && successMessage) {
      setLocalShow(true);
      setAnimationPhase('enter');
      
      // Stay phase
      const stayTimer = setTimeout(() => {
        setAnimationPhase('stay');
      }, 100);
      
      // Exit phase
      const exitTimer = setTimeout(() => {
        setAnimationPhase('exit');
      }, 400);
      
      // Hide completely
      const hideTimer = setTimeout(() => {
        setLocalShow(false);
      }, 600);
      
      return () => {
        clearTimeout(stayTimer);
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [showSuccessToast, successMessage]);
  
  if (!localShow || !successMessage) {
    return null;
  }
  
  const getTransform = () => {
    switch (animationPhase) {
      case 'enter':
        return 'translateY(20px) scale(0.8)';
      case 'stay':
        return 'translateY(-10px) scale(1.0)';
      case 'exit':
        return 'translateY(-30px) scale(0.9)';
      default:
        return 'translateY(0px) scale(1.0)';
    }
  };
  
  const getOpacity = () => {
    switch (animationPhase) {
      case 'enter':
        return 0.0;
      case 'stay':
        return 1.0;
      case 'exit':
        return 0.0;
      default:
        return 1.0;
    }
  };
  
  return (
    <Html
      center
      transform={false}
      style={{ 
        pointerEvents: 'none',
        position: 'fixed',
        top: '25%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 950,
      }}
    >
      <div
        style={{
          transform: getTransform(),
          opacity: getOpacity(),
          transition: 'all 0.2s ease-out',
          color: successColor,
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
          filter: `drop-shadow(0 0 8px ${successColor})`,
          fontFamily: 'monospace',
        }}
      >
        {successMessage}
      </div>
    </Html>
  );
}