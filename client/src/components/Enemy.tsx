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
  const { 
    isPlayerAttacking, 
    playerAttackRange, 
    combatPhase, 
    currentEnemy, 
    initiateCombat, 
    exitCombat 
  } = useCombat();
  const { playHit } = useAudio();

  const [moveDirection] = useState(() => new THREE.Vector3());
  const [combatInitiated, setCombatInitiated] = useState(false);
  
  useFrame((state, delta) => {
    if (!enemyRef.current) return;

    const playerPos = new THREE.Vector3(playerPosition.x, 0, playerPosition.z);
    const enemyPos = new THREE.Vector3(enemy.position.x, 0, enemy.position.z);
    const distanceToPlayer = playerPos.distanceTo(enemyPos);

    // Only move and initiate combat during overworld phase
    if (combatPhase === 'overworld') {
      // AI: Move towards player
      if (distanceToPlayer > 1.5) {
        moveDirection.subVectors(playerPos, enemyPos).normalize();
        const newPosition = enemy.position.clone();
        newPosition.x += moveDirection.x * ENEMY_SPEED * delta;
        newPosition.z += moveDirection.z * ENEMY_SPEED * delta;
        
        updateEnemy(enemy.id, { position: newPosition });
        enemyRef.current.position.copy(newPosition);
      }

      // Initiate combat when player gets close
      if (distanceToPlayer <= 2.0 && !combatInitiated) {
        console.log(`Player encountered enemy ${enemy.id}, initiating combat!`);
        setCombatInitiated(true);
        initiateCombat({
          id: enemy.id,
          position: { x: enemy.position.x, y: enemy.position.y, z: enemy.position.z },
          health: enemy.health,
          maxHealth: enemy.maxHealth,
          type: enemy.type
        });
      }
    }

    // Only allow combat actions during in_combat phase
    if (combatPhase === 'in_combat' && currentEnemy?.id === enemy.id) {
      // Check if player is attacking this enemy
      if (isPlayerAttacking && distanceToPlayer <= playerAttackRange) {
        const newHealth = enemy.health - 25;
        
        if (newHealth <= 0) {
          // Enemy defeated - exit combat
          removeEnemy(enemy.id);
          playHit();
          console.log(`Enemy ${enemy.id} defeated!`);
          exitCombat(true); // Victory
        } else {
          updateEnemy(enemy.id, { health: newHealth });
          playHit();
          console.log(`Enemy ${enemy.id} took damage! Health: ${newHealth}`);
        }
      }

      // Enemy attack logic (only in combat mode)
      if (state.clock.elapsedTime - enemy.lastAttackTime > 3) {
        const { takeDamage } = usePlayer.getState();
        const damage = enemy.type === 'strong' ? 20 : 15;
        takeDamage(damage);
        updateEnemy(enemy.id, { lastAttackTime: state.clock.elapsedTime });
        console.log(`Enemy ${enemy.id} attacks player for ${damage} damage in combat mode!`);
        
        // Check if player is defeated
        const { health } = usePlayer.getState();
        if (health <= 0) {
          console.log('Player defeated!');
          exitCombat(false); // Defeat
        }
      }
    }

    // Reset combat initiated flag when returning to overworld
    if (combatPhase === 'overworld' && combatInitiated) {
      setCombatInitiated(false);
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
