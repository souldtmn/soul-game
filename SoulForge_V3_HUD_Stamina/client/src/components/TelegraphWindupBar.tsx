import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTelegraph } from "../lib/stores/useTelegraph";
import { Html } from "@react-three/drei";

interface TelegraphWindupBarProps {
  enemyPosition: THREE.Vector3;
  enemyId: string;
}

export default function TelegraphWindupBar({ enemyPosition, enemyId }: TelegraphWindupBarProps) {
  const { 
    phase, 
    windupProgress, 
    showWindupBar, 
    enemyId: currentEnemyId 
  } = useTelegraph();
  
  // Only show for the current enemy being telegraphed
  if (!showWindupBar || currentEnemyId !== enemyId || phase === 'idle') {
    return null;
  }
  
  const barWidth = 3; // 3 units wide
  const barHeight = 0.3;
  const yOffset = 3; // Height above enemy
  
  // Calculate bar color based on phase
  const getBarColor = () => {
    switch (phase) {
      case 'winding_up':
        return windupProgress < 0.8 ? '#ffc66d' : '#ff9e66'; // Orange to warning orange
      case 'imminent':
        return '#ff6b6b'; // Red for danger
      case 'impact':
        return '#ff4757'; // Bright red for impact
      default:
        return '#ffc66d';
    }
  };
  
  const isFlashing = phase === 'imminent' || phase === 'impact';
  const flashOpacity = isFlashing ? (Math.sin(Date.now() * 0.02) * 0.3 + 0.7) : 1.0;
  
  return (
    <>
      {/* 3D Telegraph Bar */}
      <group position={[enemyPosition.x, enemyPosition.y + yOffset, enemyPosition.z]}>
        {/* Background bar */}
        <mesh>
          <boxGeometry args={[barWidth, barHeight, 0.1]} />
          <meshBasicMaterial color="#2a2d31" transparent opacity={0.8} />
        </mesh>
        
        {/* Progress fill */}
        <mesh position={[-barWidth/2 + (barWidth * windupProgress)/2, 0, 0.05]}>
          <boxGeometry args={[barWidth * windupProgress, barHeight, 0.05]} />
          <meshBasicMaterial 
            color={getBarColor()} 
            transparent 
            opacity={flashOpacity}
          />
        </mesh>
        
        {/* Border outline */}
        <mesh>
          <boxGeometry args={[barWidth + 0.1, barHeight + 0.1, 0.02]} />
          <meshBasicMaterial 
            color="#666a70" 
            transparent 
            opacity={0.9}
            wireframe
          />
        </mesh>
      </group>
      
      {/* HTML Overlay for Additional Effects */}
      <Html
        position={[enemyPosition.x, enemyPosition.y + yOffset + 0.8, enemyPosition.z]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div 
          className="telegraph-overlay"
          style={{
            opacity: phase === 'imminent' ? flashOpacity : 0,
            transition: 'opacity 0.1s ease',
          }}
        >
          <div 
            style={{
              color: '#ff6b6b',
              fontSize: '12px',
              fontWeight: 'bold',
              textAlign: 'center',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              animation: phase === 'imminent' ? 'pulse 0.3s infinite' : 'none',
            }}
          >
            ⚠️ INCOMING
          </div>
        </div>
      </Html>
    </>
  );
}