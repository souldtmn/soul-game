import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { usePlayer } from "../lib/stores/usePlayer";
import { useCombat } from "../lib/stores/useCombat";
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
  
  const [lastAttackTime, setLastAttackTime] = useState(0);
  
  useFrame((state, delta) => {
    if (!playerRef.current) return;

    const controls = getControls();
    const moveVector = new THREE.Vector3();
    
    // Handle movement
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
    
    // Handle defend (only during combat)
    if (controls.defend && combatPhase === 'in_combat') {
      startDefend();
      console.log("Player defending!");
    } else if (!controls.defend) {
      // Stop defending when key is released
      endDefend();
    }

    // Update invulnerability timer
    updateInvulnerabilityTimer(delta);

    // Update camera to follow player
    const targetCameraPosition = new THREE.Vector3(
      newPosition.x,
      newPosition.y + 8,
      newPosition.z + 12
    );
    
    camera.position.lerp(targetCameraPosition, 2 * delta);
    camera.lookAt(newPosition);
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
