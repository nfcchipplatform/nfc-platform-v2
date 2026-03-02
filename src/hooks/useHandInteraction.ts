// src/hooks/useHandInteraction.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type HandInteractionOptions = {
  initialDelayMs?: number;
};

export function useHandInteraction({ initialDelayMs = 2000 }: HandInteractionOptions = {}) {
  const [phase, setPhase] = useState<"INITIAL" | "IDLE" | "PRESSING">("INITIAL");
  const hasLeftInitialRef = useRef(false);

  useEffect(() => {
    if (phase !== "INITIAL" || hasLeftInitialRef.current) return;
    const timeout = window.setTimeout(() => {
      hasLeftInitialRef.current = true;
      setPhase("IDLE");
    }, initialDelayMs);
    return () => window.clearTimeout(timeout);
  }, [phase, initialDelayMs]);

  const handlePointerDown = useCallback(() => {
    if (phase === "INITIAL") return;
    setPhase("PRESSING");
  }, [phase]);

  const handlePointerUp = useCallback(() => {
    if (phase === "INITIAL") return;
    setPhase("IDLE");
  }, [phase]);

  return {
    phase,
    handlePointerDown,
    handlePointerUp,
  };
}

