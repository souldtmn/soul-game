import { useEffect, useState } from "react";
import { useGenocide } from "../lib/stores/useGenocide";

interface BossIntroProps {
  onComplete: () => void;
}

export default function BossIntro({ onComplete }: BossIntroProps) {
  const { area, dust, ash, corruption } = useGenocide();
  const [currentStage, setCurrentStage] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  const bossIntroSequence = [
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
  ];

  useEffect(() => {
    console.log(`=== BOSS INTRODUCTION SEQUENCE ===`);
    console.log(`Area: ${area} | Dust: ${dust} souls | Ash: ${ash} | Corruption: ${corruption}`);
    
    setFadeIn(true);
    
    const advanceStage = () => {
      if (currentStage < bossIntroSequence.length - 1) {
        setTimeout(() => {
          setCurrentStage(prev => prev + 1);
        }, bossIntroSequence[currentStage].duration);
      } else {
        // End of sequence
        setTimeout(() => {
          console.log("Boss introduction complete - returning to cycle");
          onComplete();
        }, bossIntroSequence[currentStage].duration);
      }
    };

    const timer = setTimeout(advanceStage, 100);
    return () => clearTimeout(timer);
  }, [currentStage, area, dust, ash, corruption, onComplete]);

  const currentMessage = bossIntroSequence[currentStage];
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