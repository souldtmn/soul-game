// client/src/components/Game.tsx
import * as THREE from "three";
import { useCombat } from "../lib/stores/useCombat";

import GameWorld from "./GameWorld";
import Player from "./Player";
import Combat from "./Combat";
import DebugHitCircle from "./DebugHitCircle";
import DamageNumbers from "./DamageNumbers";
import DebugDamageHarness from "./DebugDamageHarness";
import MusicCorruption from "./MusicCorruption";

function CombatArenaBackdrop() {
  return (
    <group>
      {/* simple arena backdrop so it’s obvious we’re in combat */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial color="#141414" />
      </mesh>
    </group>
  );
}

export default function Game() {
  const { combatPhase } = useCombat();

  const showDebug =
    typeof window !== "undefined" && !!window.TEST?.debugCircle;

  // Center of the combat arena
  const arenaCenter = new THREE.Vector3(0, 0, 0);

  // OVERWORLD BRANCH (3D-only content inside Canvas)
  if (combatPhase !== "in_combat") {
    return (
      <>
        <GameWorld />
        <Player />
        {/* Note: HUD is rendered OUTSIDE <Canvas> in App.tsx */}
      </>
    );
  }

  // COMBAT BRANCH (3D-only content inside Canvas)
  return (
    <>
      <CombatArenaBackdrop />
      <Combat />

      {/* Toggleable debug ring */}
      {showDebug && (
        <DebugHitCircle position={arenaCenter} radius={2.5} color="#4ade80" />
      )}

      <DamageNumbers />
      <DebugDamageHarness />
      <MusicCorruption />
      {/* If BossIntro renders DOM, put it in App.tsx (outside <Canvas>). */}
    </>
  );
}
