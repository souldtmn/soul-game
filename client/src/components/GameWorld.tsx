import { useTexture } from "@react-three/drei";
import Room from "./Room";
import Soul from "./Soul";
import Enemy from "./Enemy";
import { useSouls } from "../lib/stores/useSouls";
import { useEnemies } from "../lib/stores/useEnemies";
import { useGenocide } from "../lib/stores/useGenocide";
import { useMemo, useEffect } from "react";
import * as THREE from "three";

export default function GameWorld() {
  const grassTexture = useTexture("/textures/grass.png");
  const sandTexture = useTexture("/textures/sand.jpg");
  const asphaltTexture = useTexture("/textures/asphalt.png");
  
  const { souls } = useSouls();
  const { enemies } = useEnemies();
  const { killCount, currentThreshold } = useGenocide();

  // Configure textures
  grassTexture.wrapS = grassTexture.wrapT = 1000; // RepeatWrapping
  grassTexture.repeat.set(10, 10);
  sandTexture.wrapS = sandTexture.wrapT = 1000;
  sandTexture.repeat.set(8, 8);
  asphaltTexture.wrapS = asphaltTexture.wrapT = 1000;
  asphaltTexture.repeat.set(6, 6);

  // Determine ground material based on kill count
  const { groundMaterial, decayLevel } = useMemo(() => {
    let level = 0;
    let material;
    
    if (killCount >= 12) {
      // 12+ kills: Complete void - dark material
      level = 4;
      material = <meshLambertMaterial color="#1a1a1a" />;
    } else if (killCount >= 8) {
      // 8-11 kills: Cracked earth - asphalt texture
      level = 3;
      material = <meshLambertMaterial map={asphaltTexture} color="#666666" />;
    } else if (killCount >= 4) {
      // 4-7 kills: Dry earth - sand texture
      level = 2;
      material = <meshLambertMaterial map={sandTexture} color="#8B7355" />;
    } else {
      // 0-3 kills: Clean grass
      level = 1;
      material = <meshLambertMaterial map={grassTexture} />;
    }
    
    return { groundMaterial: material, decayLevel: level };
  }, [killCount, grassTexture, sandTexture, asphaltTexture]);

  // Log environmental decay changes
  useEffect(() => {
    const decayLevelNames = {
      1: "Clean Forest",
      2: "Dry Wasteland", 
      3: "Cracked Earth",
      4: "Complete Void"
    };
    
    console.log(`Environmental decay level: ${decayLevel} - ${decayLevelNames[decayLevel]} (${killCount} kills)`);
  }, [decayLevel, killCount]);

  return (
    <>
      {/* Ground plane - Progressive decay based on kill count */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        {groundMaterial}
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
