import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePlayer } from "../lib/stores/usePlayer";
import { useEnemies } from "../lib/stores/useEnemies";
import { useCombat } from "../lib/stores/useCombat";
import { useAudio } from "../lib/stores/useAudio";
import { checkCollision } from "../lib/collision";
import { ENEMY_SPEED, ENEMY_ATTACK_RANGE } from "../lib/constants";

interface EnemyProps {
  enemy: {
    id: string;
    position: THREE.Vector3;
    health: number;
    maxHealth: number;
    type: 'basic' | 'strong';
    lastAttackTime: number;
  };
}

export default function Enemy({ enemy }: EnemyProps) {
  const enemyRef = useRef<THREE.Mesh>(null);
  const { position: playerPosition } = usePlayer();
  const { updateEnemy, removeEnemy } = useEnemies();
  const { isPlayerAttacking, playerAttackRange } = useCombat();
  const { playHit } = useAudio();

  const [moveDirection] = useState(() => new THREE.Vector3());
  
  useFrame((state, delta) => {
    if (!enemyRef.current) return;

    // AI: Move towards player
    const playerPos = new THREE.Vector3(playerPosition.x, 0, playerPosition.z);
    const enemyPos = new THREE.Vector3(enemy.position.x, 0, enemy.position.z);
    const distanceToPlayer = playerPos.distanceTo(enemyPos);

    if (distanceToPlayer > 1.5) {
      // Move towards player
      moveDirection.subVectors(playerPos, enemyPos).normalize();
      const newPosition = enemy.position.clone();
      newPosition.x += moveDirection.x * ENEMY_SPEED * delta;
      newPosition.z += moveDirection.z * ENEMY_SPEED * delta;
      
      updateEnemy(enemy.id, { position: newPosition });
      enemyRef.current.position.copy(newPosition);
    }

    // Check if player is attacking this enemy
    if (isPlayerAttacking && distanceToPlayer <= playerAttackRange) {
      const newHealth = enemy.health - 25;
      
      if (newHealth <= 0) {
        // Enemy defeated
        removeEnemy(enemy.id);
        playHit();
        console.log(`Enemy ${enemy.id} defeated!`);
      } else {
        updateEnemy(enemy.id, { health: newHealth });
        playHit();
        console.log(`Enemy ${enemy.id} took damage! Health: ${newHealth}`);
      }
    }

    // Enemy attack logic (simplified)
    if (distanceToPlayer <= ENEMY_ATTACK_RANGE && 
        state.clock.elapsedTime - enemy.lastAttackTime > 2) {
      // Enemy attacks player
      updateEnemy(enemy.id, { lastAttackTime: state.clock.elapsedTime });
      console.log(`Enemy ${enemy.id} attacks player!`);
    }
  });

  const enemyColor = enemy.type === 'strong' ? "#d63031" : "#a29bfe";
  const healthRatio = enemy.health / enemy.maxHealth;

  return (
    <group>
      <mesh
        ref={enemyRef}
        position={[enemy.position.x, enemy.position.y + 1, enemy.position.z]}
        castShadow
      >
        <boxGeometry args={[1, 2, 1]} />
        <meshLambertMaterial color={enemyColor} />
        
        {/* Enemy "face" indicator */}
        <mesh position={[0, 0.3, 0.51]}>
          <planeGeometry args={[0.4, 0.4]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </mesh>
      
      {/* Health bar */}
      <mesh position={[enemy.position.x, enemy.position.y + 2.5, enemy.position.z]}>
        <planeGeometry args={[healthRatio, 0.1]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
    </group>
  );
}
