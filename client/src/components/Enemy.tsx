import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePlayer } from "../lib/stores/usePlayer";
import { useEnemies } from "../lib/stores/useEnemies";
import { useCombat } from "../lib/stores/useCombat";
import { useTelegraph } from "../lib/stores/useTelegraph";
import { useAudio } from "../lib/stores/useAudio";
import { useGenocide } from "../lib/stores/useGenocide";
import { DamageResolver } from "../lib/systems/DamageResolver";
import { ENEMY_SPEED } from "../lib/constants";
import TelegraphWindupBar from "./TelegraphWindupBar";

interface EnemyProps {
  enemy: {
    id: string;
    position: THREE.Vector3;
    health: number;
    maxHealth: number;
    type: "basic" | "strong";
    lastAttackTime: number;
  };
}

export default function Enemy({ enemy }: EnemyProps) {
  const enemyRef = useRef<THREE.Mesh>(null);
  const { position: playerPosition } = usePlayer();
  const { updateEnemy } = useEnemies();
  const { combatPhase, currentEnemy, initiateCombat, exitCombat } = useCombat();
  const {
    startWindup,
    updateWindup,
    resolveImpact,
    phase: telegraphPhase,
    hitstopActive,
  } = useTelegraph();
  const { incrementKillCount } = useGenocide();

  const [moveDirection] = useState(() => new THREE.Vector3());
  const [combatInitiated, setCombatInitiated] = useState(false);

  useFrame((state, delta) => {
    if (!enemyRef.current) return;
    if (hitstopActive) return;

    // positions
    const playerPos = new THREE.Vector3(playerPosition.x, 0, playerPosition.z);
    const enemyPos = new THREE.Vector3(enemy.position.x, 0, enemy.position.z);
    const distanceToPlayer = playerPos.distanceTo(enemyPos);

    const isTransition =
      combatPhase === "entering_combat" || combatPhase === "exiting_combat";
    const isInCombat = combatPhase === "in_combat";
    const isTarget = isInCombat && currentEnemy?.id === enemy.id;

    if (isTransition) return;

    // OVERWORLD: chase + possibly initiate combat once
    if (combatPhase === "overworld") {
      if (distanceToPlayer > 1.5) {
        moveDirection.subVectors(playerPos, enemyPos).normalize();
        const newPosition = enemy.position.clone();
        newPosition.x += moveDirection.x * ENEMY_SPEED * delta;
        newPosition.z += moveDirection.z * ENEMY_SPEED * delta;
        updateEnemy(enemy.id, { position: newPosition });
        enemyRef.current.position.copy(newPosition);
      }

      if (!combatInitiated && distanceToPlayer <= 2.0) {
        setCombatInitiated(true);
        initiateCombat({
          id: enemy.id,
          position: {
            x: enemy.position.x,
            y: enemy.position.y,
            z: enemy.position.z,
          },
          health: enemy.health,
          maxHealth: enemy.maxHealth,
          type: enemy.type,
        });
      }
      return;
    }

    // IN_COMBAT: only the engaged enemy runs telegraphs
    if (isInCombat) {
      if (!isTarget) return;

      // keep windup UI ticking
      if (telegraphPhase === "winding_up" || telegraphPhase === "imminent") {
        updateWindup(delta);
      }

      // cadence: start telegraph
      if (state.clock.elapsedTime - enemy.lastAttackTime > 4) {
        const windupDuration = enemy.type === "strong" ? 1.0 : 0.8;
        const attackDirection =
          Math.random() < 0.6 ? (Math.random() < 0.5 ? "left" : "right") : null;
        startWindup(enemy.id, windupDuration, attackDirection);
        updateEnemy(enemy.id, { lastAttackTime: state.clock.elapsedTime });
      }

      // resolve at impact
      if (telegraphPhase === "impact") {
        const result = resolveImpact();

        const { getStats: getPlayerStats } = usePlayer.getState();
        const { corruption } = useGenocide.getState();
        const playerStats = getPlayerStats();

        const baseDamage = enemy.type === "strong" ? 15 : 10;
        const damageResult = DamageResolver.enemyAttacksPlayer(
          baseDamage,
          enemy.type,
          playerStats.armor,
          result.guarded,
          result.guarded ? result.blockReduction : 0,
          result.evaded,
          corruption,
        );

        if (damageResult.finalDamage > 0) {
          const { takeDamage } = usePlayer.getState();
          takeDamage(damageResult.finalDamage);

          if (playerStats.isDead) {
            const { incrementDeath } = useGenocide.getState();
            incrementDeath();
            exitCombat(false);
          }
        }
      }
    }
  }); // <-- correct closing for useFrame (no deps array)

  // ---- derived values (render-only) ----
  const enemyColor = enemy.type === "strong" ? "#d63d3d" : "#888";
  const healthRatio = enemy.maxHealth > 0 ? enemy.health / enemy.maxHealth : 0;

  return (
    <group>
      <mesh
        ref={enemyRef}
        position={[enemy.position.x, enemy.position.y + 1, enemy.position.z]}
        castShadow
      >
        <boxGeometry args={[1, 2, 1]} />
        <meshLambertMaterial color={enemyColor} />
        {/* face indicator */}
        <mesh position={[0, 0.3, 0.51]}>
          <planeGeometry args={[0.4, 0.4]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </mesh>

      {/* Health bar */}
      <mesh
        position={[enemy.position.x, enemy.position.y + 2.5, enemy.position.z]}
      >
        <planeGeometry args={[healthRatio, 0.1]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>

      {/* Wind-up bar only for the active combat target */}
      {combatPhase === "in_combat" && currentEnemy?.id === enemy.id && (
        <TelegraphWindupBar
          enemyPosition={
            new THREE.Vector3(
              enemy.position.x,
              enemy.position.y,
              enemy.position.z,
            )
          }
          enemyId={enemy.id}
        />
      )}
    </group>
  );
}
