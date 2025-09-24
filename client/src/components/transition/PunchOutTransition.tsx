import { useMemo } from "react";
import { useCombat } from "../../lib/stores/useCombat";

export default function PunchOutTransition() {
  const { combatPhase } = useCombat();

  // map phases → visual phase
  const visual =
    combatPhase === "entering_combat" ? "fadeOut" :
    combatPhase === "exiting_combat"  ? "fadeOut" :
    "idle";

  const bars = useMemo(() => Array.from({ length: 8 }, (_, i) => i), []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[1000]">
      {/* veil */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: visual === "fadeOut" ? 0.6 : 0 }}
      />

      {/* shutters */}
      <div className="absolute inset-0">
        {bars.map((i) => {
          const topHalf = i % 2 === 0;
          const base = topHalf ? "-100%" : "100%";
          const closed = "0%";
          const translate = visual === "fadeOut" ? closed : base;
          return (
            <div
              key={i}
              className="absolute left-0 w-full bg-black"
              style={{
                height: `${100 / bars.length}%`,
                top: `${(100 / bars.length) * i}%`,
                transform: `translateY(${translate})`,
                transition: "transform 400ms ease",
                boxShadow: "inset 0 -1px rgba(255,255,255,0.04)",
              }}
            />
          );
        })}
      </div>

      {/* quick center flash when we’re fully closed — driven indirectly by store timeouts */}
      {/* optional: keep subtle flash by briefly showing this when entering/exiting if you add a 'cut' subphase later */}
    </div>
  );
}
