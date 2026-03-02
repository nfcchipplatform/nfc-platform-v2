// src/hooks/useHandInteraction.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type HandInteractionOptions = {
  holdDuration?: number;
};

export function useHandInteraction({ holdDuration = 2000 }: HandInteractionOptions = {}) {
  const [phase, setPhase] = useState<"IDLE" | "PRESSING" | "HELD">("IDLE");
  const [pressedStartTime, setPressedStartTime] = useState<number | null>(null);
  const [pressProgress, setPressProgress] = useState(0);
  const pressProgressRef = useRef(0);

  const handlePointerDown = useCallback(() => {
    setPhase("PRESSING");
    setPressedStartTime(Date.now());
    setPressProgress(0);
    pressProgressRef.current = 0;
  }, []);

  const handlePointerUp = useCallback(() => {
    setPhase("IDLE");
    setPressedStartTime(null);
    setPressProgress(0);
    pressProgressRef.current = 0;
  }, []);

  useEffect(() => {
    if (phase !== "PRESSING" || pressedStartTime === null) return;

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - pressedStartTime;
      const progress = Math.min(elapsed / holdDuration, 1.0);
      setPressProgress(progress);
      pressProgressRef.current = progress;
      if (progress >= 1) {
        setPhase("HELD");
      }
    }, 16);

    return () => window.clearInterval(interval);
  }, [phase, pressedStartTime, holdDuration]);

  return {
    phase,
    pressProgress,
    handlePointerDown,
    handlePointerUp,
  };
}

