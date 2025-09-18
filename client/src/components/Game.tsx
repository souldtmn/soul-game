import { useEffect } from "react";
import { useGame } from "../lib/stores/useGame";
import { useAudio } from "../lib/stores/useAudio";
import GameWorld from "./GameWorld";
import Player from "./Player";
import Combat from "./Combat";

export default function Game() {
  const { phase, start } = useGame();
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

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

  return (
    <>
      <GameWorld />
      <Player />
      <Combat />
    </>
  );
}
