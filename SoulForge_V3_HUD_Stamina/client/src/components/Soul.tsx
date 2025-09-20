import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSouls } from "../lib/stores/useSouls";
import { usePlayer } from "../lib/stores/usePlayer";
import { useAudio } from "../lib/stores/useAudio";

interface SoulProps {
  soul: {
    id: string;
    position: THREE.Vector3;
    collected: boolean;
    value: number;
  };
}

export default function Soul({ soul }: SoulProps) {
  const soulRef = useRef<THREE.Mesh>(null);
  const { position: playerPosition } = usePlayer();
  const { collectSoul } = useSouls();
  const { playSuccess } = useAudio();

  useFrame((state, delta) => {
    if (!soulRef.current || soul.collected) return;

    // Floating animation
    soulRef.current.position.y = soul.position.y + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    soulRef.current.rotation.y += delta * 2;

    // Check if player is close enough to collect
    const playerPos = new THREE.Vector3(playerPosition.x, 0, playerPosition.z);
    const soulPos = new THREE.Vector3(soul.position.x, 0, soul.position.z);
    const distance = playerPos.distanceTo(soulPos);

    if (distance <= 1.5) {
      collectSoul(soul.id);
      playSuccess();
      console.log(`Soul collected! Value: ${soul.value}`);
    }
  });

  if (soul.collected) return null;

  return (
    <mesh
      ref={soulRef}
      position={[soul.position.x, soul.position.y + 1, soul.position.z]}
      castShadow
    >
      <dodecahedronGeometry args={[0.3]} />
      <meshBasicMaterial color="#e17055" />
    </mesh>
  );
}
