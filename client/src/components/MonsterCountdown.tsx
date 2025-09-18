import { useState, useEffect } from "react";
import { useEnemies } from "../lib/stores/useEnemies";
import "../styles/MonsterCountdown.css";

export default function MonsterCountdown() {
  const { enemies } = useEnemies();
  const [remainingCount, setRemainingCount] = useState(0);
  const [showWhisper, setShowWhisper] = useState(false);

  useEffect(() => {
    setRemainingCount(enemies.length);
    console.log(`Monster Countdown: ${enemies.length} enemies remaining`);
    
    // Show whisper text when only 1 enemy remains
    if (enemies.length === 1) {
      setShowWhisper(true);
      console.log('Monster Countdown: Showing whisper text for final enemy');
      // Hide whisper after 3 seconds
      const timer = setTimeout(() => setShowWhisper(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowWhisper(false);
    }

    // Boss spawn preparation when all enemies are defeated
    if (enemies.length === 0) {
      console.log('Monster Countdown: All enemies defeated! Preparing for boss spawn...');
      console.log('Monster Countdown: Genocide completion achieved');
      // Here we could trigger boss spawn logic or other game state changes
      // For now, we just log the event as the counter will disappear
    }
  }, [enemies.length]);

  // Get visual style based on remaining enemies
  const getCountdownStyle = () => {
    const baseStyle = "monster-countdown";
    
    if (remainingCount >= 10) {
      return `${baseStyle} clean`;
    } else if (remainingCount >= 5) {
      return `${baseStyle} flicker`;
    } else if (remainingCount >= 2) {
      return `${baseStyle} glitch`;
    } else if (remainingCount === 1) {
      return `${baseStyle} static`;
    } else {
      return `${baseStyle} hidden`;
    }
  };

  // Get corrupted text for different distortion levels
  const getDisplayText = () => {
    if (remainingCount >= 5) {
      return `Enemies Remaining: ${remainingCount}`;
    } else if (remainingCount >= 2) {
      // Introduce some character corruption
      const base = `Enemies Remaining: ${remainingCount}`;
      const corrupted = base.split('').map((char, index) => {
        if (Math.random() < 0.1 && char !== ' ' && char !== ':') {
          return '█▓▒░'[Math.floor(Math.random() * 4)];
        }
        return char;
      }).join('');
      return corrupted;
    } else if (remainingCount === 1) {
      // Heavy corruption for final enemy
      const chars = '█▓▒░▄▀▐▌║╟╢╣';
      return Array.from({length: 20}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }
    return '';
  };

  // Don't render if no enemies (countdown complete)
  if (remainingCount === 0) {
    return null;
  }

  return (
    <div className="countdown-container">
      <div className={getCountdownStyle()}>
        {getDisplayText()}
      </div>
      
      {/* Whisper text overlay for final enemy */}
      {showWhisper && remainingCount === 1 && (
        <div className="whisper-text">
          Only one remains...
        </div>
      )}
    </div>
  );
}