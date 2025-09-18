import { useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { useEnemies } from "../lib/stores/useEnemies";
import { useGenocide } from "../lib/stores/useGenocide";
import * as THREE from "three";

export default function Room() {
  const woodTexture = useTexture("/textures/wood.jpg");
  const { addEnemy, enemies } = useEnemies();
  const { killCount, area, getCurrentAreaConfig } = useGenocide();
  const areaConfig = getCurrentAreaConfig();

  // Configure wood texture
  woodTexture.wrapS = woodTexture.wrapT = 1000;
  woodTexture.repeat.set(2, 2);

  // Area-specific wall material and decorative themes
  const { wallMaterial, showDecorations, decorativeColor } = useMemo(() => {
    const totalEnemies = areaConfig.enemyCount;
    const enemiesKilled = totalEnemies - killCount;
    const decayProgress = enemiesKilled / totalEnemies; // 0 to 1
    
    let wallMaterial, showDecorations, decorativeColor;
    
    if (area === 'Vale') {
      // Hollow Vale: Forest → Barren Decay
      if (decayProgress >= 0.85) {
        wallMaterial = <meshLambertMaterial color="#2a2a2a" />;
        showDecorations = false;
        decorativeColor = "#000000";
      } else if (decayProgress >= 0.6) {
        wallMaterial = <meshLambertMaterial map={woodTexture} color="#404040" />;
        showDecorations = true;
        decorativeColor = "#2d1810";
      } else if (decayProgress >= 0.3) {
        wallMaterial = <meshLambertMaterial map={woodTexture} color="#6a5a4a" />;
        showDecorations = true;
        decorativeColor = "#5a3a20";
      } else {
        wallMaterial = <meshLambertMaterial map={woodTexture} />;
        showDecorations = true;
        decorativeColor = "#8b4513";
      }
    } else if (area === 'Crypt') {
      // Shattered Crypt: Ice → Frost → Void
      if (decayProgress >= 0.85) {
        wallMaterial = <meshLambertMaterial color="#1a1a2a" />;
        showDecorations = false;
        decorativeColor = "#000000";
      } else if (decayProgress >= 0.6) {
        wallMaterial = <meshLambertMaterial map={woodTexture} color="#3a5a7a" />;
        showDecorations = true;
        decorativeColor = "#4a6a8a";
      } else if (decayProgress >= 0.3) {
        wallMaterial = <meshLambertMaterial map={woodTexture} color="#6a8aaa" />;
        showDecorations = true;
        decorativeColor = "#7a9abb";
      } else {
        wallMaterial = <meshLambertMaterial map={woodTexture} color="#aabbcc" />;
        showDecorations = true;
        decorativeColor = "#bbccdd";
      }
    } else if (area === 'Abyss') {
      // Abyss Below: Fire → Ash → Darkness
      if (decayProgress >= 0.85) {
        wallMaterial = <meshLambertMaterial color="#0a0a0a" />;
        showDecorations = false;
        decorativeColor = "#000000";
      } else if (decayProgress >= 0.6) {
        wallMaterial = <meshLambertMaterial map={woodTexture} color="#4a2a2a" />;
        showDecorations = true;
        decorativeColor = "#5a3a3a";
      } else if (decayProgress >= 0.3) {
        wallMaterial = <meshLambertMaterial map={woodTexture} color="#7a4a3a" />;
        showDecorations = true;
        decorativeColor = "#8a5a4a";
      } else {
        wallMaterial = <meshLambertMaterial map={woodTexture} color="#aa5533" />;
        showDecorations = true;
        decorativeColor = "#bb6644";
      }
    }
    
    return { wallMaterial, showDecorations, decorativeColor };
  }, [area, killCount, areaConfig, woodTexture]);

  // Generate area-specific enemy spawn positions
  const generateEnemyPositions = (count: number) => {
    const positions = [];
    const roomSize = 18; // Keep enemies within room bounds (-20 to 20, but with margin)
    
    for (let i = 0; i < count; i++) {
      let position;
      let attempts = 0;
      
      do {
        // Generate random position within room bounds
        const x = (Math.random() - 0.5) * roomSize;
        const z = (Math.random() - 0.5) * roomSize;
        position = new THREE.Vector3(x, 0, z);
        attempts++;
      } while (
        // Ensure minimum distance from other enemies and avoid overlap
        attempts < 50 && 
        positions.some(pos => pos.distanceTo(position) < 3)
      );
      
      positions.push(position);
    }
    
    return positions;
  };

  // Initialize room with area-specific enemies
  useEffect(() => {
    if (enemies.length === 0) {
      console.log(`Spawning ${areaConfig.enemyCount} enemies for ${areaConfig.name}`);
      const positions = generateEnemyPositions(areaConfig.enemyCount);
      
      positions.forEach((position, index) => {
        // Determine enemy type based on area and index
        let health, maxHealth, type;
        
        if (area === 'Vale') {
          // Vale: Mix of basic and strong enemies
          if (index % 4 === 0) {
            health = maxHealth = 150;
            type = 'strong';
          } else {
            health = maxHealth = 100;
            type = 'basic';
          }
        } else if (area === 'Crypt') {
          // Crypt: Tougher enemies, more variety
          if (index % 3 === 0) {
            health = maxHealth = 200;
            type = 'strong';
          } else if (index % 5 === 0) {
            health = maxHealth = 250;
            type = 'elite';
          } else {
            health = maxHealth = 120;
            type = 'basic';
          }
        } else if (area === 'Abyss') {
          // Abyss: Fewer but much stronger enemies
          if (index % 2 === 0) {
            health = maxHealth = 300;
            type = 'elite';
          } else {
            health = maxHealth = 400;
            type = 'boss';
          }
        }
        
        addEnemy({
          id: `${area}_enemy${index + 1}`,
          position,
          health,
          maxHealth,
          type,
          lastAttackTime: 0
        });
      });
    }
  }, [addEnemy, enemies.length, areaConfig, area]);

  return (
    <>
      {/* Room walls - Progressive corruption based on kill count */}
      {/* North wall */}
      <mesh position={[0, 2, -20]} receiveShadow>
        <boxGeometry args={[40, 4, 1]} />
        {wallMaterial}
      </mesh>
      
      {/* South wall */}
      <mesh position={[0, 2, 20]} receiveShadow>
        <boxGeometry args={[40, 4, 1]} />
        {wallMaterial}
      </mesh>
      
      {/* East wall */}
      <mesh position={[20, 2, 0]} receiveShadow>
        <boxGeometry args={[1, 4, 40]} />
        {wallMaterial}
      </mesh>
      
      {/* West wall */}
      <mesh position={[-20, 2, 0]} receiveShadow>
        <boxGeometry args={[1, 4, 40]} />
        {wallMaterial}
      </mesh>

      {/* Decorative elements - Fade/disappear with genocide progress */}
      {showDecorations && (
        <>
          <mesh position={[10, 0.5, 10]} castShadow>
            <boxGeometry args={[2, 1, 2]} />
            <meshLambertMaterial color={decorativeColor} />
          </mesh>

          <mesh position={[-10, 0.5, -10]} castShadow>
            <boxGeometry args={[2, 1, 2]} />
            <meshLambertMaterial color={decorativeColor} />
          </mesh>
        </>
      )}
    </>
  );
}
