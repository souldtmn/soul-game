// client/src/components/Game.tsx
import { useEffect, useRef, useState } from "react";
import BossIntro from "./BossIntro";
import { useEnemies } from "../lib/stores/useEnemies";
import { useCombat } from "../lib/stores/useCombat";
import * as THREE from "three";

import GameWorld from "./GameWorld";
import Player from "./Player";
import Combat from "./Combat";
import DebugHitCircle from "./DebugHitCircle";
import TelegraphSuccessToast from "./TelegraphSuccessToast";
import DamageNumbers from "./DamageNumbers";
import DebugDamageHarness from "./DebugDamageHarness";
import MusicCorruption from "./MusicCorruption";

function CombatArenaBackdrop() {
  return (
    <group>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial color="#141414" />
      </mesh>
    </group>
  );
}

export default function Game() {
  const { combatPhase, bossIntroSeen, setBossIntroSeen, resetEncounterFlags } = useCombat();
  const enemies = useEnemies ? useEnemies((s) => s.enemies) : [];

  const hasBoss =
    Array.isArray(enemies) &&
    enemies.some((e: any) => e?.isBoss || e?.type === "boss" || e?.tier === "boss");

  const forceIntro = typeof window !== "undefined" && !!window.TEST?.showBossIntro;

  // Local “show right now” flag. The store flag is the canonical “already seen this encounter.”
  const [showIntro, setShowIntro] = useState(false);
  const shownForEncounter = useRef(false);

  useEffect(() => {
    if (combatPhase === "in_combat") {
      if ((hasBoss && !bossIntroSeen && !shownForEncounter.current) || forceIntro) {
        setShowIntro(true);
        shownForEncounter.current = true;
      }
    } else {
      // leaving combat: clear local + store so next encounter can show again
      setShowIntro(false);
      shownForEncounter.current = false;
      resetEncounterFlags?.(); // or setBossIntroSeen(false) if you didn’t add resetEncounterFlags
    }
  }, [combatPhase, hasBoss, bossIntroSeen, forceIntro, resetEncounterFlags]);

  const showDebug =
    typeof window !== "undefined" && !!window.TEST?.debugCircle;

  const arenaCenter = new THREE.Vector3(0, 0, 0);

  if (combatPhase === "in_combat") {
    return (
      <>
        <CombatArenaBackdrop />
        <Combat />

        {showDebug && (
          <DebugHitCircle position={arenaCenter} radius={2.5} color="#4ade80" />
        )}

        <TelegraphSuccessToast />
        <DamageNumbers />
        <DebugDamageHarness />
        <MusicCorruption />

        {(showIntro || forceIntro) && (
          <BossIntro
            onComplete={() => {
              setShowIntro(false);
              setBossIntroSeen(true); // 👈 mark as seen for this encounter
              if (typeof window !== "undefined") {
                window.TEST!.showBossIntro = false; // clear manual force
              }
            }}
          />
        )}
      </>
    );
  }

  // Overworld
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
