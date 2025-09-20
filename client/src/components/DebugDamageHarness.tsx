import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePlayer } from "../lib/stores/usePlayer";
import { useCombat } from "../lib/stores/useCombat";
import { useDamageNumbers } from "../lib/stores/useDamageNumbers";
import { DamageResolver } from "../lib/systems/DamageResolver";
import { useGenocide } from "../lib/stores/useGenocide";

/**
 * DebugDamageHarness
 * A minimal tester that forces simple hits in both directions so you can
 * confirm damage numbers and timing. Remove once real combat hooks work.
 */
export default function DebugDamageHarness() {
  const player = usePlayer();
  const { currentEnemy, isPlayerAttacking, playerAttackRange } = useCombat();
  const { corruption } = useGenocide();
  const { addNumber } = useDamageNumbers.getState();

  const swingRef = { applied: false } as any;
  const enemyCD: { t: number } = { t: 0 };

  useFrame((_, delta) => {
    // ---- Player → Enemy forced hit ----
    if (currentEnemy && isPlayerAttacking) {
      const p = player.position;
      const e = currentEnemy.position;
      const dist = p.distanceTo(e);
      if (!swingRef.applied && dist <= (playerAttackRange ?? 2.5) + 0.5) {
        swingRef.applied = true;
        const result = DamageResolver.playerAttacksEnemy(
          28,
          player.stats.power ?? 0,
          currentEnemy.type === "strong" ? 0.15 : 0.05,
          false, 0, false,
          corruption,
          currentEnemy.type,
          false
        );
        currentEnemy.health = Math.max(0, currentEnemy.health - result.finalDamage);
        addNumber({
          value: result.finalDamage,
          kind: result.wasCritical ? "crit" : "normal",
          x: e.x,
          y: e.y + 1.5,
          z: e.z,
          ttl: 900
        });
      }
    } else {
      swingRef.applied = false;
    }

    // ---- Enemy → Player rhythm hit ----
    if (currentEnemy) {
      enemyCD.t -= delta;
      const p = player.position;
      const e = currentEnemy.position;
      const dist = p.distanceTo(e);
      if (enemyCD.t <= 0 && dist <= 2.2) {
        enemyCD.t = 1.2;
        const result = DamageResolver.enemyAttacksPlayer(
          10,
          currentEnemy.type === "strong" ? 0.25 : 0.1,
          player.stats.armor ?? 0,
          false, 0.5, false,
          corruption,
          currentEnemy.type
        );
        player.stats.takeDamage?.(result.finalDamage);
        addNumber({
          value: result.finalDamage,
          kind: result.wasCritical ? "crit" : "normal",
          x: p.x,
          y: p.y + 1.5,
          z: p.z,
          ttl: 900
        });
      }
    }
  });

  return null;
}
