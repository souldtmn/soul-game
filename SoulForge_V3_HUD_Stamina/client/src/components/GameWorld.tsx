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
  const { killCount, area, getCurrentAreaConfig } = useGenocide();
  const areaConfig = getCurrentAreaConfig();

  // Configure textures
  grassTexture.wrapS = grassTexture.wrapT = 1000; // RepeatWrapping
  grassTexture.repeat.set(10, 10);
  sandTexture.wrapS = sandTexture.wrapT = 1000;
  sandTexture.repeat.set(8, 8);
  asphaltTexture.wrapS = asphaltTexture.wrapT = 1000;
  asphaltTexture.repeat.set(6, 6);

  // Determine ground material and environmental theme based on area and kill count
  const { groundMaterial, decayLevel, environmentName, ambientColor } = useMemo(() => {
    const totalEnemies = areaConfig.enemyCount;
    const enemiesKilled = totalEnemies - killCount;
    const decayProgress = enemiesKilled / totalEnemies; // 0 to 1
    
    let level = 0;
    let material;
    let ambientColor = '#ffffff';
    let environmentName = '';
    
    if (area === 'Vale') {
      // Hollow Vale: Forest → Barren Decay theme
      if (decayProgress >= 0.85) {
        // 85%+ complete: Complete void - dark material
        level = 4;
        material = <meshLambertMaterial color="#1a1a1a" />;
        environmentName = "Complete Void";
        ambientColor = '#2a2a2a';
      } else if (decayProgress >= 0.6) {
        // 60-84%: Cracked earth - asphalt texture
        level = 3;
        material = <meshLambertMaterial map={asphaltTexture} color="#666666" />;
        environmentName = "Cracked Earth";
        ambientColor = '#3a3a3a';
      } else if (decayProgress >= 0.3) {
        // 30-59%: Dry earth - sand texture
        level = 2;
        material = <meshLambertMaterial map={sandTexture} color="#8B7355" />;
        environmentName = "Dry Wasteland";
        ambientColor = '#8B7355';
      } else {
        // 0-29%: Clean grass
        level = 1;
        material = <meshLambertMaterial map={grassTexture} />;
        environmentName = "Green Forest";
        ambientColor = '#4a7c59';
      }
    } else if (area === 'Crypt') {
      // Shattered Crypt: Ice → Frost → Void theme
      if (decayProgress >= 0.85) {
        // 85%+ complete: Deep void with purple/black
        level = 4;
        material = <meshLambertMaterial color="#1a1a2a" />;
        environmentName = "Eternal Void";
        ambientColor = '#2a2a4a';
      } else if (decayProgress >= 0.6) {
        // 60-84%: Frost-covered asphalt with blue tint
        level = 3;
        material = <meshLambertMaterial map={asphaltTexture} color="#4a6a8a" />;
        environmentName = "Frozen Wastes";
        ambientColor = '#5a7aaa';
      } else if (decayProgress >= 0.3) {
        // 30-59%: Icy sand with white/blue tint
        level = 2;
        material = <meshLambertMaterial map={sandTexture} color="#aaccdd" />;
        environmentName = "Frost Fields";
        ambientColor = '#cceeff';
      } else {
        // 0-29%: Icy grass with blue tint
        level = 1;
        material = <meshLambertMaterial map={grassTexture} color="#7799bb" />;
        environmentName = "Frozen Garden";
        ambientColor = '#aabbcc';
      }
    } else if (area === 'Abyss') {
      // Abyss Below: Fire → Ash → Darkness theme
      if (decayProgress >= 0.85) {
        // 85%+ complete: Complete darkness
        level = 4;
        material = <meshLambertMaterial color="#0a0a0a" />;
        environmentName = "Absolute Darkness";
        ambientColor = '#1a0a0a';
      } else if (decayProgress >= 0.6) {
        // 60-84%: Ash-covered ground with dark red
        level = 3;
        material = <meshLambertMaterial map={asphaltTexture} color="#4a2a2a" />;
        environmentName = "Ash Fields";
        ambientColor = '#5a3a3a';
      } else if (decayProgress >= 0.3) {
        // 30-59%: Burning sand with orange/red
        level = 2;
        material = <meshLambertMaterial map={sandTexture} color="#cc6633" />;
        environmentName = "Burning Sands";
        ambientColor = '#dd7744';
      } else {
        // 0-29%: Smoldering grass with red tint
        level = 1;
        material = <meshLambertMaterial map={grassTexture} color="#aa5533" />;
        environmentName = "Smoldering Grove";
        ambientColor = '#bb6644';
      }
    }
    
    return { groundMaterial: material, decayLevel: level, environmentName, ambientColor };
  }, [area, killCount, areaConfig, grassTexture, sandTexture, asphaltTexture]);

  // Log environmental decay changes
  useEffect(() => {
    console.log(`Environmental theme: ${areaConfig.name} - ${environmentName} (${areaConfig.enemyCount - killCount}/${areaConfig.enemyCount} enemies defeated)`);
  }, [decayLevel, killCount, area, environmentName, areaConfig]);

  return (
    <>
      {/* Area-specific ambient lighting */}
      <ambientLight intensity={0.4} color={ambientColor} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        color={ambientColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Ground plane - Area-specific progressive themes */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        {groundMaterial}
      </mesh>

      {/* Area-specific atmospheric effects */}
      {area === 'Crypt' && decayLevel >= 2 && (
        // Add icy fog/mist effects for Crypt
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[30, 8, 6]} />
          <meshLambertMaterial 
            color="#aaccdd" 
            transparent 
            opacity={0.1} 
            wireframe 
          />
        </mesh>
      )}
      
      {area === 'Abyss' && decayLevel >= 2 && (
        // Add burning/smoky effects for Abyss
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[25, 8, 6]} />
          <meshLambertMaterial 
            color="#dd4422" 
            transparent 
            opacity={0.15} 
            wireframe 
          />
        </mesh>
      )}

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
