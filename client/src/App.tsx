import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import Game from "./components/Game";
import HUD from "./components/HUD";
import CombatUI from "./components/CombatUI";
import BossIntro from "./components/BossIntro";
import TelegraphInputHints from "./components/TelegraphInputHints";
import { useGenocide } from "./lib/stores/useGenocide";

// Define control keys for the game
enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  attack = 'attack',
  defend = 'defend',
  interact = 'interact',
}

const controls = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.backward, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.leftward, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.rightward, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.attack, keys: ["KeyJ", "Space"] },
  { name: Controls.defend, keys: ["KeyK", "Shift"] },
  { name: Controls.interact, keys: ["KeyE", "Enter"] },
];

function App() {
  const { bossUnlocked, resetGenocide, transitionToNextArea, corruption } = useGenocide();
  const [showBossIntro, setShowBossIntro] = useState(false);

  // Handle boss unlock trigger
  useEffect(() => {
    if (bossUnlocked && !showBossIntro) {
      console.log("=== BOSS TRIGGER ACTIVATED ===");
      setShowBossIntro(true);
    }
  }, [bossUnlocked, showBossIntro]);

  // Handle boss intro completion
  const handleBossIntroComplete = () => {
    console.log("=== BOSS INTRO COMPLETE - TRANSITIONING TO NEXT AREA ===");
    setShowBossIntro(false);
    transitionToNextArea(); // Advance to next area or complete the game
  };

  return (
    <>
      {/* Boss Introduction Overlay */}
      {showBossIntro && (
        <BossIntro onComplete={handleBossIntroComplete} />
      )}
      
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        position: 'relative', 
        overflow: 'hidden',
        // Apply corruption visual effects to entire application
        filter: corruption > 0 ? (
          `hue-rotate(${corruption * 20}deg) ` +
          `contrast(${1 + corruption * 0.15}) ` +
          `brightness(${1 - corruption * 0.1}) ` +
          `saturate(${1 + corruption * 0.2})`
        ) : 'none',
        transition: 'filter 0.5s ease',
      }}>
      <KeyboardControls map={controls}>
        <Canvas
          shadows
          camera={{
            position: [0, 8, 12],
            fov: 45,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: false,
            powerPreference: "default",
            alpha: true,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false
          }}
          onCreated={(state) => {
            console.log('WebGL context created successfully');
            console.log('WebGL renderer:', state.gl);
          }}
          fallback={
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif'
            }}>
              <h2>WebGL Not Available</h2>
              <p>This game requires WebGL to run. Please try:</p>
              <ul style={{ textAlign: 'left', margin: '0 auto', display: 'inline-block' }}>
                <li>Updating your browser</li>
                <li>Enabling hardware acceleration</li>
                <li>Checking WebGL support at webglreport.com</li>
              </ul>
            </div>
          }
        >
          <color attach="background" args={["#1a1a2e"]} />
          
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />

          <Suspense fallback={null}>
            <Game />
          </Suspense>
        </Canvas>
        
        <HUD />
        <CombatUI />
        <TelegraphInputHints />
      </KeyboardControls>
      </div>
    </>
  );
}

export default App;
