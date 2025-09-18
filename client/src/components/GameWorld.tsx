import { useTexture } from "@react-three/drei";
import Room from "./Room";
import Soul from "./Soul";
import Enemy from "./Enemy";
import { useSouls } from "../lib/stores/useSouls";
import { useEnemies } from "../lib/stores/useEnemies";

export default function GameWorld() {
  const grassTexture = useTexture("/textures/grass.png");
  const { souls } = useSouls();
  const { enemies } = useEnemies();

  // Configure grass texture
  grassTexture.wrapS = grassTexture.wrapT = 1000; // RepeatWrapping
  grassTexture.repeat.set(10, 10);

  return (
    <>
      {/* Ground plane */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshLambertMaterial map={grassTexture} />
      </mesh>

      {/* Current room */}
      <Room />

      {/* Enemies */}
      {enemies.map((enemy) => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}

      {/* Souls */}
      {souls.map((soul) => (
        <Soul key={soul.id} soul={soul} />
      ))}
    </>
  );
}
