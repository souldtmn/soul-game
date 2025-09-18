import { useTexture } from "@react-three/drei";
import { useEffect } from "react";
import { useEnemies } from "../lib/stores/useEnemies";
import * as THREE from "three";

export default function Room() {
  const woodTexture = useTexture("/textures/wood.jpg");
  const { addEnemy, enemies } = useEnemies();

  // Configure wood texture
  woodTexture.wrapS = woodTexture.wrapT = 1000;
  woodTexture.repeat.set(2, 2);

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
      {/* Room walls */}
      {/* North wall */}
      <mesh position={[0, 2, -20]} receiveShadow>
        <boxGeometry args={[40, 4, 1]} />
        <meshLambertMaterial map={woodTexture} />
      </mesh>
      
      {/* South wall */}
      <mesh position={[0, 2, 20]} receiveShadow>
        <boxGeometry args={[40, 4, 1]} />
        <meshLambertMaterial map={woodTexture} />
      </mesh>
      
      {/* East wall */}
      <mesh position={[20, 2, 0]} receiveShadow>
        <boxGeometry args={[1, 4, 40]} />
        <meshLambertMaterial map={woodTexture} />
      </mesh>
      
      {/* West wall */}
      <mesh position={[-20, 2, 0]} receiveShadow>
        <boxGeometry args={[1, 4, 40]} />
        <meshLambertMaterial map={woodTexture} />
      </mesh>

      {/* Some decorative elements */}
      <mesh position={[10, 0.5, 10]} castShadow>
        <boxGeometry args={[2, 1, 2]} />
        <meshLambertMaterial color="#8b4513" />
      </mesh>

      <mesh position={[-10, 0.5, -10]} castShadow>
        <boxGeometry args={[2, 1, 2]} />
        <meshLambertMaterial color="#8b4513" />
      </mesh>
    </>
  );
}
