import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useCombat } from "../lib/stores/useCombat";
import { usePlayer } from "../lib/stores/usePlayer";
import { useEnemies } from "../lib/stores/useEnemies";
import { useSouls } from "../lib/stores/useSouls";
import { useAudio } from "../lib/stores/useAudio";
import * as THREE from "three";

export default function Combat() {
  const { 
    isPlayerAttacking, 
    attackTimer, 
    endAttack, 
    playerAttackRange 
  } = useCombat();
  const { position: playerPosition } = usePlayer();
  const { enemies } = useEnemies();
  const { addSoul } = useSouls();
  const { playSuccess } = useAudio();

  useFrame((state, delta) => {
    // Update attack timer
    if (isPlayerAttacking) {
      const { updateAttackTimer } = useCombat.getState();
      updateAttackTimer(delta);
      
      // End attack when timer reaches 0
      if (attackTimer <= 0) {
        endAttack();
      }
    }
  });

  // Handle soul generation when enemies are defeated
  useEffect(() => {
    // This will be triggered by enemy removal in Enemy component
    // Souls are created at enemy position when they're defeated
  }, [enemies]);

  return null; // This component handles logic only
}
