// src/hooks/useHandInteraction.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SoulImageConfig } from "../lib/soulImageConfig";

type HandInteractionOptions = {
  currentSoulImage: SoulImageConfig | null;
  onAdvanceImage: () => void;
  onLikeExplosion?: () => void;
  likeDuration?: number;
  fadeDuration?: number;
};

export function useHandInteraction({
  currentSoulImage,
  onAdvanceImage,
  onLikeExplosion,
  likeDuration = 3000,
  fadeDuration = 600,
}: HandInteractionOptions) {
  const [phase, setPhase] = useState<"LOADING" | "STANDBY" | "PRESSED">("LOADING");
  const [pressedStartTime, setPressedStartTime] = useState<number | null>(null);
  const [soulOpacity, setSoulOpacity] = useState(0.8);
  const [pressProgress, setPressProgress] = useState(0);
  const [chargeFail, setChargeFail] = useState(false);
  const [showLike, setShowLike] = useState(false);
  const [likeBurst, setLikeBurst] = useState(false);
  const [likeLocked, setLikeLocked] = useState(false);
  const [likeConfirmedAt, setLikeConfirmedAt] = useState<number | null>(null);

  const pressProgressRef = useRef(0);
  const likeTimeoutRef = useRef<number | null>(null);
  const likedThisPressRef = useRef(false);

  const handlePointerDown = useCallback(() => {
    setPhase("PRESSED");
    setPressedStartTime(Date.now());
    setPressProgress(0);
    pressProgressRef.current = 0;
    likedThisPressRef.current = false;
  }, []);

  const handlePointerUp = useCallback(() => {
    if (likedThisPressRef.current) return;
    if (pressProgressRef.current < 1) {
      setChargeFail(true);
      window.setTimeout(() => setChargeFail(false), 220);
    }
    setPhase("STANDBY");
    setPressedStartTime(null);
    setSoulOpacity(0.8);
    setPressProgress(0);
    pressProgressRef.current = 0;
    const shouldAdvance = !likedThisPressRef.current;
    likedThisPressRef.current = false;
    if (likeTimeoutRef.current) {
      window.clearTimeout(likeTimeoutRef.current);
      likeTimeoutRef.current = null;
    }
    if (shouldAdvance) {
      onAdvanceImage();
    }
  }, [onAdvanceImage]);

  useEffect(() => {
    if (phase !== "PRESSED" || !currentSoulImage || likedThisPressRef.current) return;
    if (likeTimeoutRef.current) {
      window.clearTimeout(likeTimeoutRef.current);
    }

    likeTimeoutRef.current = window.setTimeout(() => {
      if (likedThisPressRef.current || phase !== "PRESSED") return;
      likedThisPressRef.current = true;
      setLikeLocked(true);
      setLikeConfirmedAt(Date.now());

      if (typeof window === "undefined") return;
      const key = "soulLikeHistory";
      const existingRaw = window.localStorage.getItem(key);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const nextEntry = {
        id: currentSoulImage.id,
        path: currentSoulImage.path,
        tags: currentSoulImage.tags ?? [],
        likedAt: new Date().toISOString(),
      };
      const updated = [nextEntry, ...existing].slice(0, 20);
      window.localStorage.setItem(key, JSON.stringify(updated));

      setShowLike(true);
      window.setTimeout(() => setShowLike(false), 1200);
      const burstDelay = 500;
      const burstDuration = 900;
      window.setTimeout(() => {
        setLikeBurst(true);
        onLikeExplosion?.();
        window.setTimeout(() => {
          setLikeBurst(false);
          setPhase("STANDBY");
          setPressedStartTime(null);
          setSoulOpacity(0.8);
          setPressProgress(0);
          pressProgressRef.current = 0;
          setLikeLocked(false);
          onAdvanceImage();
        }, burstDuration);
      }, burstDelay);
    }, likeDuration);

    return () => {
      if (likeTimeoutRef.current) {
        window.clearTimeout(likeTimeoutRef.current);
        likeTimeoutRef.current = null;
      }
    };
  }, [phase, currentSoulImage, likeDuration, onAdvanceImage, onLikeExplosion]);

  useEffect(() => {
    if (phase === "STANDBY") {
      setLikeBurst(false);
      setShowLike(false);
      setLikeLocked(false);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "PRESSED" || pressedStartTime === null) return;

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - pressedStartTime;
      const progress = Math.min(elapsed / likeDuration, 1.0);
      const fadeProgress = Math.min(elapsed / fadeDuration, 1.0);
      setSoulOpacity(0.8 + (0.2 * fadeProgress));
      setPressProgress(progress);
      pressProgressRef.current = progress;
    }, 16);

    return () => window.clearInterval(interval);
  }, [phase, pressedStartTime, likeDuration, fadeDuration]);

  return {
    phase,
    setPhase,
    soulOpacity,
    pressProgress,
    chargeFail,
    showLike,
    likeBurst,
    likeLocked,
    likeConfirmedAt,
    handlePointerDown,
    handlePointerUp,
  };
}

