import { useCallback, useEffect, useRef, useState } from "react";
import { Burst, CollisionEffect } from "../types";
import { TWO_PI, fastSin, fastCos } from "../math";
import { featureFlags } from "@/utils";

export const useParticleEffects = (): {
  clickBursts: Burst[];
  setClickBursts: React.Dispatch<React.SetStateAction<Burst[]>>;
  clickBurstsRef: React.MutableRefObject<Burst[]>;
  collisionEffects: CollisionEffect[];
  setCollisionEffects: React.Dispatch<React.SetStateAction<CollisionEffect[]>>;
  createCollisionEffect: (
    x: number,
    y: number,
    color: string,
    score: number,
  ) => CollisionEffect;
} => {
  // Click burst particles state and ref
  const [clickBursts, setClickBursts] = useState<Burst[]>([]);
  const clickBurstsRef = useRef<Burst[]>([]);

  // Collision effects state
  const [collisionEffects, setCollisionEffects] = useState<CollisionEffect[]>(
    [],
  );

  // Create collision effect function with device-aware optimization
  const createCollisionEffect = useCallback(
    (x: number, y: number, color: string, score: number): CollisionEffect => {
      const isMobile = window.innerWidth < 768;

      const newEffect: CollisionEffect = {
        x,
        y,
        color,
        score,
        time: Date.now(),
        particles: [],
      };

      // Create particles with device-aware count, scaled by feature flag value
      // particleEffects.value: 100 = normal, 50 = half, 200 = double
      const particleMultiplier = (featureFlags.getValue("particleEffects") ?? 100) / 100;
      const baseCount = isMobile ? 10 : 15;
      const variance = isMobile ? 5 : 10;
      const scaledBase = Math.floor(baseCount * particleMultiplier);
      const scaledVariance = Math.floor(variance * particleMultiplier);
      const particleCount = Math.floor(Math.random() * Math.max(1, scaledVariance)) + Math.max(1, scaledBase);

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * TWO_PI;
        const speed = Math.random() * 4 + 2;
        const size = Math.random() * 3 + 1;

        newEffect.particles.push({
          x,
          y,
          vx: fastCos(angle) * speed,
          vy: fastSin(angle) * speed,
          size,
          alpha: 1.0,
        });
      }

      return newEffect;
    },
    [],
  );

  // Update click bursts ref when state changes
  useEffect(() => {
    clickBurstsRef.current = clickBursts;
  }, [clickBursts]);

  return {
    clickBursts,
    setClickBursts,
    clickBurstsRef,
    collisionEffects,
    setCollisionEffects,
    createCollisionEffect,
  };
};
