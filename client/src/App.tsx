// client/src/App.tsx
import React from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";

// Game components
import Game from "./components/Game";
import HUD from "./components/HUD";
import CombatUI from "./components/CombatUI";
import TelegraphInputHints from "./components/TelegraphInputHints";
import BossIntro from "./components/BossIntro";
import DebugHitCircle from "./components/DebugHitCircle"; // 👈 new

/* ===========================
   Controls mapping
   =========================== */
enum Controls {
  forward = "forward",
  backward = "backward",
  leftward = "leftward",
  rightward = "rightward",
  attack = "attack",
  defend = "defend",
  interact = "interact",
}

const controls = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.backward, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.leftward, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.rightward, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.attack, keys: ["KeyJ", "Space"] },
  { name: Controls.defend, keys: ["KeyK", "ShiftLeft"] },
  { name: Controls.interact, keys: ["KeyE", "Enter"] },
];

/* ===========================
   Error boundary
   =========================== */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error?: Error }> {
  constructor(props: any) {
    super(props);
    this.state = { error: undefined };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error("💥 ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ color: "#f66", padding: 16, fontFamily: "monospace", background: "#1b1b22" }}>
          <strong>Component crashed:</strong> {String(this.state.error.message || this.state.error)}
        </div>
      );
    }
    return this.props.children;
  }
}

/* ===========================
   TEST toggles
   =========================== */
const TEST = {
  scene: false,      // true = blue cube, false = <Game />
  hud: true,         // toggle HUD
  combatUI: true,    // toggle CombatUI
  hints: true,       // toggle TelegraphInputHints
  bossIntro: false,  // toggle BossIntro overlay
  debugCircle: true, // 👈 toggle Debug hit circle(s)
};

/* ===========================
   App
   =========================== */
export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0b0c14" }}>
      <KeyboardControls map={controls}>
        <Canvas camera={{ position: [0, 6, 12], fov: 45 }} shadows>
          <ambientLight intensity={0.35} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

          {TEST.scene ? (
            // Blue cube test
            <mesh position={[0, 1, 0]} castShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#4466ff" />
            </mesh>
          ) : (
            // Real game
            <ErrorBoundary>
              <Game />
            </ErrorBoundary>
          )}

          {TEST.debugCircle && (
            <>
              {/* Full circle under player */}
              <DebugHitCircle radius={3} thickness={0.25} color="#5eead4" />
              {/* 120° swipe arc */}
              <DebugHitCircle
                radius={3.2}
                thickness={0.18}
                color="#ff6b6b"
                startAngleDeg={-60}
                endAngleDeg={60}
                opacity={0.5}
              />
            </>
          )}
        </Canvas>

        {/* Overlays */}
        {TEST.hud && (
          <ErrorBoundary>
            <HUD />
          </ErrorBoundary>
        )}
        {TEST.combatUI && (
          <ErrorBoundary>
            <CombatUI />
          </ErrorBoundary>
        )}
        {TEST.hints && (
          <ErrorBoundary>
            <TelegraphInputHints />
          </ErrorBoundary>
        )}
        {TEST.bossIntro && (
          <ErrorBoundary>
            <BossIntro onComplete={() => console.log("BossIntro complete")} />
          </ErrorBoundary>
        )}
      </KeyboardControls>
    </div>
  );
}
