// client/src/components/CombatUI.tsx
import { useCombat } from "../lib/stores/useCombat";

export default function CombatUI() {
  const { combatPhase, currentEnemy } = useCombat();

  // Normalize your phase names just in case other parts use entering_combat/exiting_combat
  const entering = combatPhase === "entering" || combatPhase === "entering_combat";
  const inCombat = combatPhase === "in_combat";
  const exiting  = combatPhase === "exiting"  || combatPhase === "exiting_combat";

  // Render nothing outside combat-related phases
  if (!entering && !inCombat && !exiting) return null;

  const hp   = currentEnemy?.health ?? 0;
  const max  = Math.max(1, currentEnemy?.maxHealth ?? 1);
  const pct  = Math.max(0, Math.min(100, (hp / max) * 100));
  const name = (currentEnemy?.type ?? "Unknown").toString().toUpperCase();

  if (entering) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/95 p-6 rounded-lg text-center shadow-xl">
          <h2 className="text-2xl font-bold mb-2">Entering Combat!</h2>
          <p className="text-lg">Preparing to fight {name}...</p>
        </div>
      </div>
    );
  }

  if (inCombat) {
    return (
      <div className="fixed inset-0 z-30 pointer-events-none">
        {/* Enemy header */}
        <div className="mt-8 mx-auto max-w-md text-center pointer-events-auto">
          <h2 className="text-3xl font-bold text-white drop-shadow mb-3">
            Fighting: {name}
          </h2>

          {/* Enemy HP */}
          <div className="w-64 h-6 mx-auto bg-gray-700/70 rounded overflow-hidden border border-white/30">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-white/90 mt-1 text-sm">
            HP: {hp} / {max}
          </p>
        </div>

        {/* (Add more combat-only DOM here later if needed) */}
      </div>
    );
  }

  if (exiting) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/95 p-6 rounded-lg text-center shadow-xl">
          <h2 className="text-2xl font-bold mb-2">Combat Complete!</h2>
          <p className="text-lg">Returning to exploration...</p>
        </div>
      </div>
    );
  }

  return null;
}
