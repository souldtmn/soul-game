import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePlayer } from "../lib/stores/usePlayer";
import { useEnemies } from "../lib/stores/useEnemies";
import { useCombat } from "../lib/stores/useCombat";
import { useTelegraph } from "../lib/stores/useTelegraph";
import { useAudio } from "../lib/stores/useAudio";
import { useGenocide } from "../lib/stores/useGenocide";
import { DamageResolver } from "../lib/systems/DamageResolver";
import { checkCollision } from "../lib/collision";
import { ENEMY_SPEED, ENEMY_ATTACK_RANGE } from "../lib/constants";
import TelegraphWindupBar from "./TelegraphWindupBar";

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
  const { 
    startWindup, 
    updateWindup, 
    resolveImpact, 
    phase: telegraphPhase 
  } = useTelegraph();
  const { playHit } = useAudio();
  const { incrementKillCount } = useGenocide();

  const [moveDirection] = useState(() => new THREE.Vector3());
  const [combatInitiated, setCombatInitiated] = useState(false);
  
  useFrame((state, delta) => {
    if (!enemyRef.current) return;

    const playerPos = new THREE.Vector3(playerPosition.x, 0, playerPosition.z);
    const enemyPos = new THREE.Vector3(enemy.position.x, 0, enemy.position.z);
    const distanceToPlayer = playerPos.distanceTo(enemyPos);
    
    // Update telegraph wind-up if this enemy is telegraphing (both winding_up AND imminent)
    if ((telegraphPhase === 'winding_up' || telegraphPhase === 'imminent') && currentEnemy?.id === enemy.id) {
      updateWindup(delta);
    }

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
      // Combat.tsx now handles all damage application, Enemy.tsx only handles enemy attacks
      
      // Telegraph Attack System - ONLY attack system now
      if (state.clock.elapsedTime - enemy.lastAttackTime > 4) {
        // Determine attack parameters based on enemy type
        const windupDuration = enemy.type === 'strong' ? 1.0 : 0.8;
        const attackDirection = Math.random() < 0.6 ? (Math.random() < 0.5 ? 'left' : 'right') : null;
        
        // Start telegraph wind-up
        console.log(`⚡ Enemy ${enemy.id} (${enemy.type}) begins telegraph attack (${windupDuration}s)`);
        startWindup(enemy.id, windupDuration, attackDirection);
        
        // Update last attack time to prevent spam
        updateEnemy(enemy.id, { lastAttackTime: state.clock.elapsedTime });
      }
      
      // Handle telegraph resolution when impact occurs
      if (telegraphPhase === 'impact' && currentEnemy?.id === enemy.id) {
        console.log('💥 Telegraph impact - resolving damage...');
        const result = resolveImpact();
        
        // Use DamageResolver for consistent damage calculation
        const { getStats: getPlayerStats } = usePlayer.getState();
        const { corruption } = useGenocide.getState();
        const playerStats = getPlayerStats();
        
        const baseDamage = enemy.type === 'strong' ? 15 : 10;
        const damageResult = DamageResolver.enemyAttacksPlayer(
          baseDamage,
          enemy.type,
          playerStats.armor,
          result.guarded,
          result.guarded ? result.blockReduction : 0, // Use skill-based block reduction
          result.evaded,
          corruption
        );
        
        // Apply calculated damage
        if (damageResult.finalDamage > 0) {
          const { takeDamage } = usePlayer.getState();
          takeDamage(damageResult.finalDamage);
          
          // Log with detailed damage info
          const statusFlags = [
            damageResult.wasCritical ? 'CRIT!' : '',
            damageResult.wasBlocked ? 'BLOCKED' : '',
            damageResult.wasEvaded ? 'EVADED' : ''
          ].filter(Boolean).join(' ');
          
          console.log(`👹 Enemy ${enemy.id} hits for ${damageResult.finalDamage} damage ${statusFlags}`);
          
          // Check if player is defeated (after takeDamage already applied)
          if (playerStats.isDead) {
            console.log('💀 Player defeated by telegraph attack!');
            
            // Track death for corruption system
            const { incrementDeath } = useGenocide.getState();
            incrementDeath();
            
            exitCombat(false); // Defeat
          }
        } else {
          // Perfect evade or complete block
          const reason = damageResult.wasEvaded ? 'perfectly evaded' : 'completely blocked';
          console.log(`🏃 Player ${reason} telegraph attack!`);
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
      
      {/* Telegraph Wind-up Bar */}
      <TelegraphWindupBar 
        enemyPosition={new THREE.Vector3(enemy.position.x, enemy.position.y, enemy.position.z)}
        enemyId={enemy.id}
      />
    </group>
  );
}
