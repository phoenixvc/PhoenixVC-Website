import { useCallback, useEffect, useRef, useState } from "react";
import { Burst, CollisionEffect } from "../types";
import { TWO_PI, fastSin, fastCos } from "../math";

export const useParticleEffects = (): {
  clickBursts: Burst[];
  setClickBursts: React.Dispatch<React.SetStateAction<Burst[]>>;
  clickBurstsRef: React.MutableRefObject<Burst[]>;
  collisionEffects: CollisionEffect[];
  setCollisionEffects: React.Dispatch<React.SetStateAction<CollisionEffect[]>>;
  createCollisionEffect: (x: number, y: number, color: string, score: number) => CollisionEffect;
} => {
    // Click burst particles state and ref
    const [clickBursts, setClickBursts] = useState<Burst[]>([]);
    const clickBurstsRef = useRef<Burst[]>([]);

    // Collision effects state
    const [collisionEffects, setCollisionEffects] = useState<CollisionEffect[]>([]);

    // Create collision effect function with device-aware optimization
    const createCollisionEffect = useCallback((x: number, y: number, color: string, score: number): CollisionEffect => {
      const isMobile = window.innerWidth < 768;

      const newEffect: CollisionEffect = {
        x,
        y,
        color,
        score,
        time: Date.now(),
        particles: []
      };

      // Create particles with device-aware count
      const particleCount = Math.floor(Math.random() * (isMobile ? 5 : 10)) +
                           (isMobile ? 10 : 15);

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
          alpha: 1.0
        });
      }

      return newEffect;
    }, []);

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
      createCollisionEffect
    };
  };
