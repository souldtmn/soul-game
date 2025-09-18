import { useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { useEnemies } from "../lib/stores/useEnemies";
import { useGenocide } from "../lib/stores/useGenocide";
import * as THREE from "three";

export default function Room() {
  const woodTexture = useTexture("/textures/wood.jpg");
  const { addEnemy, enemies } = useEnemies();
  const { killCount } = useGenocide();

  // Configure wood texture
  woodTexture.wrapS = woodTexture.wrapT = 1000;
  woodTexture.repeat.set(2, 2);

  // Determine wall material and decorative visibility based on kill count
  const { wallMaterial, showDecorations, decorativeColor } = useMemo(() => {
    if (killCount >= 12) {
      // 12+ kills: Nearly black walls, no decorations
      return {
        wallMaterial: <meshLambertMaterial color="#2a2a2a" />,
        showDecorations: false,
        decorativeColor: "#000000"
      };
    } else if (killCount >= 8) {
      // 8-11 kills: Dark/corrupted walls, minimal decorations
      return {
        wallMaterial: <meshLambertMaterial map={woodTexture} color="#404040" />,
        showDecorations: true,
        decorativeColor: "#2d1810"
      };
    } else if (killCount >= 4) {
      // 4-7 kills: Darker wood, desaturated decorations
      return {
        wallMaterial: <meshLambertMaterial map={woodTexture} color="#6a5a4a" />,
        showDecorations: true,
        decorativeColor: "#5a3a20"
      };
    } else {
      // 0-3 kills: Normal wood, normal decorations
      return {
        wallMaterial: <meshLambertMaterial map={woodTexture} />,
        showDecorations: true,
        decorativeColor: "#8b4513"
      };
    }
  }, [killCount, woodTexture]);

  // Initialize room with enemies
  useEffect(() => {
    if (enemies.length === 0) {
      // Add some initial enemies
      addEnemy({
        id: 'enemy1',
        position: new THREE.Vector3(5, 0, 5),
        health: 100,
        maxHealth: 100,
        type: 'basic',
        lastAttackTime: 0
      });

      addEnemy({
        id: 'enemy2',
        position: new THREE.Vector3(-5, 0, -5),
        health: 150,
        maxHealth: 150,
        type: 'strong',
        lastAttackTime: 0
      });

      addEnemy({
        id: 'enemy3',
        position: new THREE.Vector3(-8, 0, 8),
        health: 100,
        maxHealth: 100,
        type: 'basic',
        lastAttackTime: 0
      });
    }
  }, [addEnemy, enemies.length]);

  return (
    <>
      {/* Room walls - Progressive corruption based on kill count */}
      {/* North wall */}
      <mesh position={[0, 2, -20]} receiveShadow>
        <boxGeometry args={[40, 4, 1]} />
        {wallMaterial}
      </mesh>
      
      {/* South wall */}
      <mesh position={[0, 2, 20]} receiveShadow>
        <boxGeometry args={[40, 4, 1]} />
        {wallMaterial}
      </mesh>
      
      {/* East wall */}
      <mesh position={[20, 2, 0]} receiveShadow>
        <boxGeometry args={[1, 4, 40]} />
        {wallMaterial}
      </mesh>
      
      {/* West wall */}
      <mesh position={[-20, 2, 0]} receiveShadow>
        <boxGeometry args={[1, 4, 40]} />
        {wallMaterial}
      </mesh>

      {/* Decorative elements - Fade/disappear with genocide progress */}
      {showDecorations && (
        <>
          <mesh position={[10, 0.5, 10]} castShadow>
            <boxGeometry args={[2, 1, 2]} />
            <meshLambertMaterial color={decorativeColor} />
          </mesh>

          <mesh position={[-10, 0.5, -10]} castShadow>
            <boxGeometry args={[2, 1, 2]} />
            <meshLambertMaterial color={decorativeColor} />
          </mesh>
        </>
      )}
    </>
  );
}
