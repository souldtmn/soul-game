import * as THREE from "three";

// Simple AABB collision detection
export function checkCollision(
  pos1: THREE.Vector3,
  size1: THREE.Vector3,
  pos2: THREE.Vector3,
  size2: THREE.Vector3
): boolean {
  return (
    pos1.x - size1.x / 2 < pos2.x + size2.x / 2 &&
    pos1.x + size1.x / 2 > pos2.x - size2.x / 2 &&
    pos1.z - size1.z / 2 < pos2.z + size2.z / 2 &&
    pos1.z + size1.z / 2 > pos2.z - size2.z / 2
  );
}

// Check if point is within bounds
export function isWithinBounds(
  position: THREE.Vector3,
  bounds: { x: number; z: number }
): boolean {
  return (
    position.x >= -bounds.x &&
    position.x <= bounds.x &&
    position.z >= -bounds.z &&
    position.z <= bounds.z
  );
}

// Get distance between two points (2D)
export function getDistance2D(pos1: THREE.Vector3, pos2: THREE.Vector3): number {
  const dx = pos1.x - pos2.x;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dz * dz);
}
