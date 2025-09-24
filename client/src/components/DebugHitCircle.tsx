import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type DebugHitCircleProps = {
  /** Outer radius in world units */
  radius?: number;
  /** Ring thickness in world units (outer - inner) */
  thickness?: number;
  /** Center position */
  position?: [number, number, number];
  /** Rotation (defaults to lying flat on the ground) */
  rotation?: [number, number, number];
  /** Segments for smoothness */
  segments?: number;
  /** Start angle (deg) for arcs; 0 = +X axis, CCW */
  startAngleDeg?: number;
  /** End angle (deg) for arcs */
  endAngleDeg?: number;
  /** Color & opacity */
  color?: string;
  opacity?: number;
  /** Gentle breathing pulse */
  pulse?: boolean;
  pulseSpeed?: number; // cycles per second
};

export default function DebugHitCircle({
  radius = 3,
  thickness = 0.25,
  position = [0, 0.01, 0],
  rotation = [-Math.PI / 2, 0, 0], // flat on XZ plane
  segments = 64,
  startAngleDeg = 0,
  endAngleDeg = 360,
  color = "#ff6b6b",
  opacity = 0.6,
  pulse = true,
  pulseSpeed = 1.5,
}: DebugHitCircleProps) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  // Clamp inner radius so it never goes negative
  const [inner, outer] = useMemo(() => {
    const o = Math.max(thickness, radius);
    const i = Math.max(0.0001, o - thickness);
    return [i, o];
  }, [radius, thickness]);

  // Convert degrees to radians for RingGeometry
  const { thetaStart, thetaLength } = useMemo(() => {
    const s = THREE.MathUtils.degToRad(startAngleDeg);
    // allow wrap-around gracefully
    let lenDeg = endAngleDeg - startAngleDeg;
    if (lenDeg <= 0) lenDeg += 360;
    return { thetaStart: s, thetaLength: THREE.MathUtils.degToRad(lenDeg) };
  }, [startAngleDeg, endAngleDeg]);

  useFrame((state) => {
    if (!pulse || !matRef.current) return;
    const t = state.clock.getElapsedTime();
    // subtle opacity + thickness “breathing”
    const osc = (Math.sin(t * Math.PI * 2 * pulseSpeed) + 1) / 2; // 0..1
    matRef.current.opacity = THREE.MathUtils.lerp(opacity * 0.6, opacity, osc);
  });

  return (
    <mesh position={position} rotation={rotation}>
      {/* RingGeometry: [innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength] */}
      <ringGeometry args={[inner, outer, segments, 1, thetaStart, thetaLength]} />
      <meshBasicMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false} /* draw nicely over floor */
      />
    </mesh>
  );
}
