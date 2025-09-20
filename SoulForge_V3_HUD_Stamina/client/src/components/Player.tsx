import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { usePlayer } from "../lib/stores/usePlayer";
import { useCombat } from "../lib/stores/useCombat";
import { useTelegraph } from "../lib/stores/useTelegraph";
import { checkCollision } from "../lib/collision";
import { PLAYER_SPEED, ROOM_BOUNDS } from "../lib/constants";

enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  attack = 'attack',
  defend = 'defend',
}

export default function Player() {
  const playerRef = useRef<THREE.Mesh>(null);
  const [, getControls] = useKeyboardControls<Controls>();
  const { camera } = useThree();
  const { position, setPosition, health, isInvulnerable, updateInvulnerabilityTimer } = usePlayer();
  const { startAttack, startDefend, endDefend, isPlayerAttacking, combatPhase } = useCombat();
  const { 
    setDefending, 
    attemptEvade, 
    updateEffects, 
    cameraShakeActive, 
    cameraShakeIntensity, 
    hitstopActive 
  } = useTelegraph();
  
  const [lastAttackTime, setLastAttackTime] = useState(0);
  const [lastEvadeTime, setLastEvadeTime] = useState(0);
  
  useFrame((state, delta) => {
    if (!playerRef.current) return;

    // Update telegraph effects (hitstop, camera shake)
    updateEffects(delta);

    const controls = getControls();
    const moveVector = new THREE.Vector3();
    
    // Skip gameplay updates during hitstop (but allow camera effects)
    if (hitstopActive) {
      // Gameplay paused during hitstop - no logging to prevent spam
    } else {
      // Handle movement (only when not in hitstop)
      if (controls.forward) {
        moveVector.z -= PLAYER_SPEED * delta;
      }
      if (controls.backward) {
        moveVector.z += PLAYER_SPEED * delta;
      }
      if (controls.leftward) {
        moveVector.x -= PLAYER_SPEED * delta;
      }
      if (controls.rightward) {
        moveVector.x += PLAYER_SPEED * delta;
      }
    }

    // Calculate new position
    const newPosition = new THREE.Vector3(
      position.x + moveVector.x,
      position.y,
      position.z + moveVector.z
    );

    // Check bounds
    if (
      newPosition.x >= -ROOM_BOUNDS.x &&
      newPosition.x <= ROOM_BOUNDS.x &&
      newPosition.z >= -ROOM_BOUNDS.z &&
      newPosition.z <= ROOM_BOUNDS.z
    ) {
      setPosition(newPosition.x, newPosition.y, newPosition.z);
      playerRef.current.position.copy(newPosition);
    }

    // Handle game actions (only when not in hitstop)
    if (!hitstopActive) {
      // Handle attack (only during combat) - REQUIRES PLAYER INPUT!
      if (controls.attack && combatPhase === 'in_combat') {
        const currentTime = state.clock.elapsedTime;
        // Prevent spam clicking - cooldown system
        if (currentTime - lastAttackTime >= 0.8) {
          startAttack();
          setLastAttackTime(currentTime);
          console.log("💥 Player attacks with skill!");
        } else {
          console.log("⏱️ Attack on cooldown - timing matters!");
        }
      }
      
      // Handle defend (only during combat) - Telegraph System
      const isDefendPressed = controls.defend && combatPhase === 'in_combat';
      if (isDefendPressed) {
        startDefend();
        setDefending(true);
        // Defending active - no per-frame logging to prevent spam
      } else if (!controls.defend) {
        // Stop defending when key is released
        endDefend();
        setDefending(false);
      }
      
      // Handle evasion input (A/D keys during combat)
      if (combatPhase === 'in_combat') {
        const currentTime = state.clock.elapsedTime;
        
        // Left evade (A key)
        if (controls.leftward && currentTime - lastEvadeTime >= 0.3) {
          attemptEvade('left');
          setLastEvadeTime(currentTime);
        }
        
        // Right evade (D key)
        if (controls.rightward && currentTime - lastEvadeTime >= 0.3) {
          attemptEvade('right');
          setLastEvadeTime(currentTime);
        }
      }

      // Update invulnerability timer
      updateInvulnerabilityTimer(delta);
    }

    // Update camera to follow player with shake effects
    const targetCameraPosition = new THREE.Vector3(
      newPosition.x,
      newPosition.y + 8,
      newPosition.z + 12
    );
    
    // Apply camera shake if active
    if (cameraShakeActive) {
      const shakeX = (Math.random() - 0.5) * cameraShakeIntensity;
      const shakeY = (Math.random() - 0.5) * cameraShakeIntensity;
      const shakeZ = (Math.random() - 0.5) * cameraShakeIntensity * 0.5;
      
      targetCameraPosition.x += shakeX;
      targetCameraPosition.y += shakeY;
      targetCameraPosition.z += shakeZ;
      
      // Reduced logging to prevent spam
      // console.log(`📹 Camera shake: intensity ${cameraShakeIntensity.toFixed(2)}`);
    }
    
    camera.position.lerp(targetCameraPosition, 2 * delta);
    camera.lookAt(new THREE.Vector3(
      newPosition.x + (cameraShakeActive ? (Math.random() - 0.5) * cameraShakeIntensity * 0.3 : 0),
      newPosition.y + (cameraShakeActive ? (Math.random() - 0.5) * cameraShakeIntensity * 0.3 : 0),
      newPosition.z + (cameraShakeActive ? (Math.random() - 0.5) * cameraShakeIntensity * 0.3 : 0)
    ));
  });

  // Player appearance changes based on state
  const playerColor = isInvulnerable ? "#ff6b6b" : (isPlayerAttacking ? "#4ecdc4" : "#45b7d1");
  const playerScale = isPlayerAttacking ? 1.2 : 1.0;

  return (
    <mesh
      ref={playerRef}
      position={[position.x, position.y + 1, position.z]}
      castShadow
      scale={[playerScale, playerScale, playerScale]}
    >
      <boxGeometry args={[1, 2, 1]} />
      <meshLambertMaterial color={playerColor} />
      
      {/* Player "face" indicator */}
      <mesh position={[0, 0.3, 0.51]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Health indicator */}
      <mesh position={[0, 1.2, 0]}>
        <planeGeometry args={[health / 50, 0.1]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>
    </mesh>
  );
}
