// client/src/components/DebugHitCircle.tsx
import * as THREE from "three";
import { useMemo } from "react";
import { useCombat } from "../lib/stores/useCombat";

type Props = {
  position?: THREE.Vector3 | [number, number, number];
  radius?: number;
  inner?: number;         // optional alternative to radius
  outer?: number;         // optional thickness control
  segments?: number;
  thetaStart?: number;
  thetaLength?: number;
  color?: string;
  opacity?: number;
  rotationX?: number;     // default -Math.PI / 2
  rotationY?: number;
  rotationZ?: number;
};

export default function DebugHitCircle({
  position = new THREE.Vector3(0, 0.02, 0),
  radius = 2.5,
  inner,
  outer,
  segments = 64,
  thetaStart = 0,
  thetaLength = Math.PI * 2,
  color = "#4ade80",
  opacity = 0.6,
  rotationX = -Math.PI / 2,
  rotationY = 0,
  rotationZ = 0,
}: Props) {
  const { combatPhase } = useCombat();

  // ✅ Self-guard: only render in combat AND when TEST.debugCircle is true
  const showDebug =
    typeof window !== "undefined" && !!window.TEST?.debugCircle;

  if (combatPhase !== "in_combat" || !showDebug) return null;

  // Geometry sizes
  const innerR = inner ?? (radius - 0.3);
  const outerR = outer ?? radius;

  const geom = useMemo(
    () => new THREE.RingGeometry(innerR, outerR, segments, 1, thetaStart, thetaLength),
    [innerR, outerR, segments, thetaStart, thetaLength]
  );

  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        wireframe: false,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
      }),
    [color, opacity]
  );

  const posArray =
    position instanceof THREE.Vector3
      ? [position.x, position.y, position.z]
      : position;

  return (
    <group position={posArray as [number, number, number]} rotation={[rotationX, rotationY, rotationZ]}>
      <mesh geometry={geom} material={mat} />
    </group>
  );
}
