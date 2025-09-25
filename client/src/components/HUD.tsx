// client/src/components/HUD.tsx
import { useCombat } from "../lib/stores/useCombat";

export default function HUD() {
  // HUD must never render during combat
  const { combatPhase } = useCombat();
  if (combatPhase === "in_combat") return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#fff",
      }}
    >
      {/* HP panel */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "rgba(0,0,0,0.75)",
          border: "1px solid #fff",
          borderRadius: 8,
          padding: 12,
          minWidth: 220,
          pointerEvents: "auto",
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 6 }}>HEALTH</div>
        <div
          style={{
            width: 220,
            height: 18,
            background: "#222",
            border: "1px solid #666",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div style={{ width: "100%", height: "100%", background: "#22c55e" }} />
        </div>
        <div style={{ fontSize: 12, marginTop: 4 }}>100 / 100</div>
      </div>
    </div>
  );
}
