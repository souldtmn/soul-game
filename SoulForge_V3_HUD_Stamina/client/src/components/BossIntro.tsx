import { useEffect, useState } from "react";
import { useGenocide } from "../lib/stores/useGenocide";

interface BossIntroProps {
  onComplete: () => void;
}

export default function BossIntro({ onComplete }: BossIntroProps) {
  const { area, dust, ash, corruption } = useGenocide();
  const [currentStage, setCurrentStage] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  // Create sequence once on mount to avoid dependency issues
  const [bossIntroSequence] = useState([
    {
      text: "Chains snap.",
      duration: 2000,
    },
    {
      text: "Silence.",
      duration: 2000,
    },
    {
      text: "The void stirs.",
      duration: 2500,
    },
    {
      text: `${dust} souls have been reaped.`,
      duration: 2500,
    },
    {
      text: `${ash} fragments of ash remain.`,
      duration: 2500,
    },
    {
      text: corruption > 0 ? `Corruption level: ${corruption}` : "The vessel remains pure.",
      duration: 3000,
    },
    {
      text: "Something approaches...",
      duration: 3000,
    }
  ]);

  // Mount effect - run sequence once
  useEffect(() => {
    console.log(`=== BOSS INTRODUCTION SEQUENCE START ===`);
    console.log(`Area: ${area} | Dust: ${dust} souls | Ash: ${ash} | Corruption: ${corruption}`);
    console.log(`🎯 Boss unlocked! Starting introduction sequence...`);
    
    setFadeIn(true);
    
    let stageIndex = 0;
    
    const runSequence = () => {
      if (stageIndex < bossIntroSequence.length - 1) {
        setTimeout(() => {
          stageIndex++;
          setCurrentStage(stageIndex);
          runSequence(); // Recurse to next stage
        }, bossIntroSequence[stageIndex].duration);
      } else {
        // Final stage - complete sequence
        setTimeout(() => {
          console.log("✅ Boss introduction COMPLETE - triggering area transition");
          console.log(`🔄 Calling onComplete() for area transition from ${area}`);
          onComplete();
        }, bossIntroSequence[stageIndex].duration);
      }
    };
    
    // Start sequence after brief delay
    const startTimer = setTimeout(runSequence, 100);
    
    return () => {
      clearTimeout(startTimer);
      console.log("⚠️ BossIntro unmounted - sequence may be interrupted");
    };
  }, []); // Empty dependency array - run once on mount

  const currentMessage = bossIntroSequence[currentStage] || { text: "Loading...", duration: 1000 };
  const progressPercent = ((currentStage + 1) / bossIntroSequence.length) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      opacity: fadeIn ? 1 : 0,
      transition: 'opacity 0.5s ease-in-out',
    }}>
      {/* Boss Intro Text */}
      <div style={{
        color: '#e17055',
        fontSize: `${24 + corruption * 4}px`,
        fontFamily: 'monospace',
        textAlign: 'center',
        marginBottom: '40px',
        letterSpacing: `${2 + corruption}px`,
        textShadow: `0 0 ${10 + corruption * 5}px rgba(225, 112, 85, 0.6)`,
        opacity: fadeIn ? 1 : 0,
        transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s ease-out',
      }}>
        {currentMessage.text}
      </div>

      {/* SOUL Statistics */}
      <div style={{
        color: '#fff',
        fontSize: '16px',
        fontFamily: 'monospace',
        textAlign: 'center',
        marginBottom: '30px',
        opacity: 0.8,
        letterSpacing: '1px',
      }}>
        Area: {area} | Souls Reaped: {dust} | Ash Fragments: {ash} | Corruption: {corruption}
      </div>

      {/* Progress Indicator */}
      <div style={{
        width: '300px',
        height: '2px',
        backgroundColor: '#333',
        marginBottom: '20px',
        borderRadius: '1px',
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          backgroundColor: '#e17055',
          borderRadius: '1px',
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Stage Indicator */}
      <div style={{
        color: '#999',
        fontSize: '12px',
        fontFamily: 'monospace',
      }}>
        {currentStage + 1} / {bossIntroSequence.length}
      </div>

      {/* Corruption Visual Effects */}
      {corruption > 0 && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `radial-gradient(circle, transparent 0%, rgba(213, 48, 49, ${corruption * 0.1}) 100%)`,
          pointerEvents: 'none',
          animation: corruption >= 2 ? 'corruptionPulse 2s infinite ease-in-out' : 'none',
        }} />
      )}

      <style>
        {`
          @keyframes corruptionPulse {
            0%, 100% { opacity: ${corruption * 0.1}; }
            50% { opacity: ${corruption * 0.2}; }
          }
        `}
      </style>
    </div>
  );
}