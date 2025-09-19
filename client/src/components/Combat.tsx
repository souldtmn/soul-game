import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useCombat } from "../lib/stores/useCombat";
import { usePlayer } from "../lib/stores/usePlayer";
import { useEnemies } from "../lib/stores/useEnemies";
import { useSouls } from "../lib/stores/useSouls";
import { useAudio } from "../lib/stores/useAudio";
import { useGenocide } from "../lib/stores/useGenocide";
import { DamageResolver } from "../lib/systems/DamageResolver";
import * as THREE from "three";

export default function Combat() {
  const { 
    isPlayerAttacking, 
    attackTimer, 
    endAttack, 
    playerAttackRange,
    combatPhase,
    currentEnemy,
    exitCombat
  } = useCombat();
  const { position: playerPosition } = usePlayer();
  const { enemies, updateEnemy, removeEnemy } = useEnemies();
  const { addSoul } = useSouls();
  const { playHit, playSuccess } = useAudio();
  const { incrementKillCount } = useGenocide();
  
  // Track damage application to prevent multiple hits per attack
  const damageApplied = useRef(false);

  useFrame((state, delta) => {
    // Update attack timer
    if (isPlayerAttacking) {
      const { updateAttackTimer } = useCombat.getState();
      updateAttackTimer(delta);
      
      // Hit detection and damage application during player attacks
      if (combatPhase === 'in_combat' && currentEnemy && !damageApplied.current) {
        const playerPos = new THREE.Vector3(playerPosition.x, 0, playerPosition.z);
        const enemy = enemies.find(e => e.id === currentEnemy.id);
        
        if (enemy) {
          const enemyPos = new THREE.Vector3(enemy.position.x, 0, enemy.position.z);
          const distanceToEnemy = playerPos.distanceTo(enemyPos);
          
          // Apply damage if within range (only once per attack)
          if (distanceToEnemy <= playerAttackRange) {
            console.log(`🗡️ Player attacking ${enemy.id} at range ${distanceToEnemy.toFixed(2)}`);
            // Use DamageResolver for consistent player attacks
            const { getStats: getPlayerStats } = usePlayer.getState();
            const { corruption } = useGenocide.getState();
            const playerStats = getPlayerStats();
            
            const baseDamage = 35;
            const damageResult = DamageResolver.playerAttacksEnemy(
              baseDamage,
              playerStats.power,
              enemy.type === 'strong' ? 0.15 : 0.05, // reasonable enemy armor
              false, // no blocking for enemies yet
              0, // no block reduction
              false, // no evading for enemies
              corruption,
              enemy.type, // defender type
              false // not a counter attack
            );
            
            const newHealth = enemy.health - damageResult.finalDamage;
            
            damageApplied.current = true; // Prevent multiple hits per attack
            
            // Enhanced logging with damage calculation details
            const statusFlags = damageResult.wasCritical ? '💥 CRITICAL!' : '⚔️';
            console.log(`${statusFlags} Enemy ${enemy.id} takes ${damageResult.finalDamage} damage`);
            
            if (newHealth <= 0) {
              // Enemy defeated - handle death sequence
              console.log(`🏆 Enemy ${enemy.id} defeated with skill!`);
              
              // Remove enemy (this will create soul with area-prefixed ID in useEnemies.tsx)
              removeEnemy(enemy.id);
              
              // Trigger Phase 2 systems
              incrementKillCount(); // This triggers Phase 2 genocide tracking
              playHit();
              
              // Exit combat with victory
              exitCombat(true);
            } else {
              // Apply damage and continue combat
              updateEnemy(enemy.id, { health: newHealth });
              playHit();
              console.log(`Enemy ${enemy.id} health: ${newHealth}/${enemy.maxHealth}`);
            }
          }
        }
      }
      
      // End attack when timer reaches 0
      if (attackTimer <= 0) {
        endAttack();
        damageApplied.current = false; // Reset for next attack
      }
    }
  });

  return null; // This component handles logic only
}
