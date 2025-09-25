// client/src/App.tsx
import React from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";

// Game scene (handles HUD/CombatUI phase-aware)
import Game from "./components/Game";
import TelegraphInputHints from "./components/TelegraphInputHints";
import BossIntro from "./components/BossIntro";

// -------------------------------------------------
// Global TEST toggles (single source of truth)
// -------------------------------------------------
declare global {
  interface Window {
    TEST?: {
      debugCircle?: boolean;   // used inside Game + DebugHitCircle component
      showBossIntro?: boolean; // App-level overlay demo
      showHints?: boolean;     // App-level overlay
      showBlueCube?: boolean;  // swap scene for a quick sanity test
    };
  }
}

// Initialize once, but don't clobber changes from DevTools
if (typeof window !== "undefined") {
  window.TEST = {
    debugCircle: window.TEST?.debugCircle ?? true,
    showBossIntro: window.TEST?.showBossIntro ?? false,
    showHints: window.TEST?.showHints ?? true,
    showBlueCube: window.TEST?.showBlueCube ?? false,
  };
}

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
   App
   =========================== */
export default function App() {
  const showBlueCube = typeof window !== "undefined" && !!window.TEST?.showBlueCube;
  const showHints = typeof window !== "undefined" && !!window.TEST?.showHints;
  const showBossIntro = typeof window !== "undefined" && !!window.TEST?.showBossIntro;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0b0c14" }}>
      <KeyboardControls map={controls}>
        <Canvas camera={{ position: [0, 6, 12], fov: 45 }} shadows>
          <ambientLight intensity={0.35} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

          {showBlueCube ? (
            // Blue cube test scene
            <mesh position={[0, 1, 0]} castShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#4466ff" />
            </mesh>
          ) : (
            // Real game (HUD/CombatUI handled inside by phase)
            <ErrorBoundary>
              <Game />
            </ErrorBoundary>
          )}
        </Canvas>

        {/* App-level overlays that are not phase-bound */}
        {showHints && (
          <ErrorBoundary>
            <TelegraphInputHints />
          </ErrorBoundary>
        )}

        {showBossIntro && (
          <ErrorBoundary>
            <BossIntro onComplete={() => console.log("BossIntro complete")} />
          </ErrorBoundary>
        )}
      </KeyboardControls>
    </div>
  );
}
