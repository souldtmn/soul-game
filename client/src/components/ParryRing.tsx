// ❌ DEACTIVATED — not in use anywhere
export default function ParryRing() {
  return null;
}


// client/src/components/ParryRing.tsx
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTelegraph } from "../lib/stores/useTelegraph";
import { usePlayer } from "../lib/stores/usePlayer";
import { useCombat } from "../lib/stores/useCombat";

export default function ParryRing() {
  const ringRef = useRef<THREE.Mesh>(null);
  const { showDefendRing, isDefending, phase } = useTelegraph();
  const { position: playerPosition } = usePlayer();
  const { combatPhase } = useCombat();

  // 🔒 Hard gate: never render in overworld
  if (combatPhase !== "in_combat" || !showDefendRing || !isDefending) {
    return null;
  }

  useFrame(({ clock }, delta) => {
    if (!ringRef.current) return;
    // Spin + pulse while defending
    ringRef.current.rotation.z += delta * 2;
    const scale = 1 + Math.sin(clock.elapsedTime * 8) * 0.1;
    ringRef.current.scale.setScalar(isDefending ? scale : 1);
    // Lock to player
    ringRef.current.position.set(
      playerPosition.x,
      playerPosition.y + 0.1,
      playerPosition.z
    );
  });

  const intensity = phase === "imminent" ? 0.3 : 0.18;
  const color = phase === "imminent" ? "#79c0ff" : "#4ecdc4";

  return (
    <>
      {/* Main defense ring */}
      <mesh
        ref={ringRef}
        position={[playerPosition.x, playerPosition.y + 0.1, playerPosition.z]}
      >
        <ringGeometry args={[2.2, 2.8, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={intensity}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner glow ring */}
      <mesh
        position={[playerPosition.x, playerPosition.y + 0.05, playerPosition.z]}
        rotation={[0, 0, Math.PI / 4]}
      >
        <ringGeometry args={[1.8, 2.2, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={intensity * 0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer energy field */}
      <mesh
        position={[playerPosition.x, playerPosition.y + 0.15, playerPosition.z]}
        rotation={[0, 0, -Math.PI / 6]}
      >
        <ringGeometry args={[2.8, 3.2, 20]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={intensity * 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}
