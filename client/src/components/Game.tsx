// client/src/components/Game.tsx
import { useCombat } from "../lib/stores/useCombat";

import GameWorld from "./GameWorld";
import Player from "./Player";
import Combat from "./Combat";

// New debug import
import DebugHitCircle from "./DebugHitCircle";

import TelegraphSuccessToast from "./TelegraphSuccessToast";
import DamageNumbers from "./DamageNumbers";
import DebugDamageHarness from "./DebugDamageHarness";
import MusicCorruption from "./MusicCorruption";
// If you actually have this file, you can uncomment:
// import TelegraphEvadeArrows from "./TelegraphEvadeArrows";

function CombatArenaBackdrop() {
  return (
    <group>
      {/* simple arena backdrop so it’s obvious we’re in combat */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial color="#141414" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.6, 64]} />
        <meshBasicMaterial color="#404040" />
      </mesh>
    </group>
  );
}

export default function Game() {
  const { combatPhase } = useCombat();

  if (combatPhase === "in_combat") {
    return (
      <>
        <CombatArenaBackdrop />
        <Combat />

        {/* Debug hit circles for testing */}
        <DebugHitCircle radius={2.5} color="#4ade80" />
        <DebugHitCircle
          radius={3}
          thickness={0.2}
          color="#f87171"
          startAngleDeg={-60}
          endAngleDeg={60}
        />

        {/* If you have TelegraphEvadeArrows.tsx, uncomment below */}
        {/* <TelegraphEvadeArrows /> */}

        <TelegraphSuccessToast />
        <DamageNumbers />
        <DebugDamageHarness />
        <MusicCorruption />
      </>
    );
  }

  // Overworld (and during entering/exiting)
  return (
    <>
      <GameWorld />
      <Player />
      <DamageNumbers />
      <DebugDamageHarness />
      <MusicCorruption />
    </>
  );
}
