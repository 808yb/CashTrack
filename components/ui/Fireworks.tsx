"use client"

import React, { useEffect, useRef } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";

interface FireworksProps {
  fire: boolean;
}

const makeShot = (instance: any) => {
  instance && instance({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.7 },
    startVelocity: 40,
    ticks: 60,
    gravity: 0.9,
    scalar: 1.2,
    colors: ["#FFD700", "#FF69B4", "#00BFFF", "#32CD32", "#FF4500"],
  });
};

export default function Fireworks({ fire }: FireworksProps) {
  const confettiRef = useRef<any>(null);
  const prevFire = useRef(false);

  // Get the confetti instance using onInit
  const handleInit = ({ confetti }: { confetti: any }) => {
    confettiRef.current = confetti;
  };

  useEffect(() => {
    if (fire && !prevFire.current) {
      makeShot(confettiRef.current);
    }
    prevFire.current = fire;
  }, [fire]);

  return (
    <div
      style={{
        position: "fixed",
        pointerEvents: "none",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
      }}
    >
      <ReactCanvasConfetti
        onInit={handleInit}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </div>
  );
} 