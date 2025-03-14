// constants/tokens/animations.ts

export const animationDurations = {
    fastest: "100ms",
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
    slowest: "700ms",
  } as const;

  export const animationEasings = {
    linear: "linear",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    // Bounce effects
    easeInBack: "cubic-bezier(0.6, -0.28, 0.735, 0.045)",
    easeOutBack: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    easeInOutBack: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  } as const;

  export const animations = {
    fadeIn: {
      keyframes: `
        from { opacity: 0; }
        to { opacity: 1; }
      `,
      duration: animationDurations.normal,
      easing: animationEasings.easeOut,
    },
    fadeOut: {
      keyframes: `
        from { opacity: 1; }
        to { opacity: 0; }
      `,
      duration: animationDurations.normal,
      easing: animationEasings.easeIn,
    },
    slideInUp: {
      keyframes: `
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      `,
      duration: animationDurations.normal,
      easing: animationEasings.easeOut,
    },
    slideInDown: {
      keyframes: `
        from {
          transform: translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      `,
      duration: animationDurations.normal,
      easing: animationEasings.easeOut,
    },
    zoomIn: {
      keyframes: `
        from {
          transform: scale(0.95);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      `,
      duration: animationDurations.normal,
      easing: animationEasings.easeOut,
    },
    zoomOut: {
      keyframes: `
        from {
          transform: scale(1);
          opacity: 1;
        }
        to {
          transform: scale(0.95);
          opacity: 0;
        }
      `,
      duration: animationDurations.normal,
      easing: animationEasings.easeIn,
    },
    pulse: {
      keyframes: `
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      `,
      duration: animationDurations.slow,
      easing: animationEasings.easeInOut,
    },
    spin: {
      keyframes: `
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      `,
      duration: animationDurations.slow,
      easing: animationEasings.linear,
    },
  } as const;

  // Animation utility function
  export function createAnimation(
    name: keyof typeof animations,
    options?: {
      duration?: string;
      easing?: string;
      delay?: string;
      iterationCount?: string | number;
      direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
      fillMode?: "none" | "forwards" | "backwards" | "both";
    }
  ): string {
    const animation = animations[name];
    const duration = options?.duration || animation.duration;
    const easing = options?.easing || animation.easing;
    const delay = options?.delay || "0s";
    const iterationCount = options?.iterationCount || "1";
    const direction = options?.direction || "normal";
    const fillMode = options?.fillMode || "both";

    return `${name} ${duration} ${easing} ${delay} ${iterationCount} ${direction} ${fillMode}`;
  }
