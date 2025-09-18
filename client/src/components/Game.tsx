import { useEffect } from "react";
import { useGame } from "../lib/stores/useGame";
import { useAudio } from "../lib/stores/useAudio";
import { useCombat } from "../lib/stores/useCombat";
import GameWorld from "./GameWorld";
import Player from "./Player";
import Combat from "./Combat";

export default function Game() {
  const { phase, start } = useGame();
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  const { combatPhase, currentEnemy } = useCombat();

  // Initialize audio
  useEffect(() => {
    const bgMusic = new Audio('/sounds/background.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hitAudio = new Audio('/sounds/hit.mp3');
    hitAudio.volume = 0.5;
    setHitSound(hitAudio);

    const successAudio = new Audio('/sounds/success.mp3');
    successAudio.volume = 0.7;
    setSuccessSound(successAudio);

    // Start the game
    start();
  }, [setBackgroundMusic, setHitSound, setSuccessSound, start]);

  if (phase === "ready") {
    return null;
  }

  // Render different content based on combat phase
  if (combatPhase === 'overworld') {
    return (
      <>
        <GameWorld />
        <Player />
        <Combat />
      </>
    );
  }

  if (combatPhase === 'entering_combat') {
    return (
      <>
        {/* Keep the world visible during transition */}
        <GameWorld />
        <Player />
        <Combat />
        {/* Transition overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Entering Combat!</h2>
            <p className="text-lg">Preparing to fight {currentEnemy?.type} enemy...</p>
          </div>
        </div>
      </>
    );
  }

  if (combatPhase === 'in_combat') {
    return (
      <>
        {/* Punch-Out style combat screen */}
        <div className="fixed inset-0 bg-gradient-to-b from-blue-900 to-purple-900 flex flex-col">
          {/* Combat Arena Background */}
          <div className="flex-1 relative overflow-hidden">
            {/* Enemy Display */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Fighting: {currentEnemy?.type?.toUpperCase()} ENEMY
                </h2>
                <div className="w-32 h-32 bg-red-600 mx-auto rounded-lg flex items-center justify-center">
                  <div className="text-6xl text-white">👹</div>
                </div>
                {/* Enemy Health Bar */}
                <div className="mt-4 w-64 h-6 bg-gray-300 rounded mx-auto">
                  <div 
                    className="h-full bg-red-500 rounded transition-all duration-300"
                    style={{
                      width: `${((currentEnemy?.health || 0) / (currentEnemy?.maxHealth || 1)) * 100}%`
                    }}
                  />
                </div>
                <p className="text-white mt-2">
                  HP: {currentEnemy?.health}/{currentEnemy?.maxHealth}
                </p>
              </div>
            </div>
            
            {/* Player Combat Display */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-500 mx-auto rounded-lg flex items-center justify-center mb-4">
                  <div className="text-4xl text-white">🥊</div>
                </div>
                <p className="text-white text-lg font-bold">PLAYER</p>
              </div>
            </div>
            
            {/* Combat Instructions */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <div className="bg-black bg-opacity-75 p-4 rounded">
                <p className="text-white">
                  <span className="font-bold">SPACEBAR:</span> Attack | 
                  <span className="font-bold">S:</span> Defend
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Still include Combat component for logic */}
        <Combat />
      </>
    );
  }

  if (combatPhase === 'exiting_combat') {
    return (
      <>
        {/* Keep the world visible during transition */}
        <GameWorld />
        <Player />
        <Combat />
        {/* Transition overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Combat Complete!</h2>
            <p className="text-lg">Returning to exploration...</p>
          </div>
        </div>
      </>
    );
  }

  // Fallback to overworld
  return (
    <>
      <GameWorld />
      <Player />
      <Combat />
    </>
  );
}
