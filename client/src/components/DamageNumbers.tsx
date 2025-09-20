
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useDamageNumbers } from "../lib/stores/useDamageNumbers";
import { memo } from "react";

function kindToStyle(kind: string) {
  switch (kind) {
    case 'crit': return 'text-yellow-300 drop-shadow-[0_0_6px_rgba(250,250,0,0.7)]';
    case 'blocked': return 'text-cyan-300 drop-shadow-[0_0_6px_rgba(0,250,250,0.6)]';
    case 'dodged': return 'text-green-300 drop-shadow-[0_0_6px_rgba(0,250,120,0.6)]';
    case 'heal': return 'text-emerald-300';
    default: return 'text-white';
  }
}

const DamageNumbers = memo(function DamageNumbers() {
  const { items, purge } = useDamageNumbers();
  useFrame(() => purge());

  return (
    <group>
      {items.map((i) => {
        const life = (Date.now() - i.createdAt) / i.ttl;
        const yOffset = Math.min(1, life) * 1.2;
        const opacity = 1 - Math.min(1, life);
        const scale = 0.8 + 0.4 * (1 - Math.min(1, life));
        return (
          <Html key={i.id} position={[i.x, i.y + yOffset, i.z]} center style={{ pointerEvents: 'none', transform: `scale(${scale})`, opacity }}>
            <div className={`px-2 py-1 font-bold select-none ${kindToStyle(i.kind)}`}>
              {i.text ?? (i.kind === 'heal' ? `+${i.value}` : `-${i.value}`)}
            </div>
          </Html>
        );
      })}
    </group>
  );
});

export default DamageNumbers;
