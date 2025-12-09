// hooks/useOffscreenCanvas.ts
// Hook for managing offscreen canvas layers for improved rendering performance
// Offscreen canvas allows pre-rendering static or slowly-changing content

/**
 * # Offscreen Canvas Performance Optimization
 *
 * ## Overview
 * This hook provides multi-layer offscreen canvas rendering to improve performance
 * by separating content into layers that can be rendered independently.
 *
 * ## When to Use Offscreen Canvas
 *
 * ✅ **Good use cases:**
 * - Static backgrounds that rarely change
 * - Content that updates less frequently than the main animation (e.g., every 100ms)
 * - Complex visual elements that can be pre-rendered once
 * - Separating UI layers from game/animation layers
 *
 * ❌ **Avoid using for:**
 * - Content that changes every frame (stars moving constantly)
 * - Small, simple draw operations (overhead exceeds benefit)
 * - When memory is constrained (each layer uses additional GPU memory)
 *
 * ## Optimal Usage Pattern
 *
 * ```typescript
 * // 1. Initialize with appropriate layers
 * const offscreen = useOffscreenCanvas({
 *   width: canvasWidth,
 *   height: canvasHeight,
 *   layers: ['background', 'midground', 'effects'],
 *   enabled: true,
 * });
 *
 * // 2. In your render loop, check if layer needs redraw
 * if (offscreen.shouldRedraw('background')) {
 *   const layer = offscreen.getLayer('background');
 *   if (layer) {
 *     layer.ctx.clearRect(0, 0, width, height);
 *     // Draw to layer.ctx instead of main ctx
 *     drawBackgroundElements(layer.ctx);
 *   }
 * }
 *
 * // 3. Composite layer to main canvas (very fast - just a drawImage)
 * offscreen.compositeToMain(mainCtx, 'background');
 *
 * // 4. Mark layer as dirty when content changes
 * offscreen.markDirty('background');
 * ```
 *
 * ## Layer Recommendations
 *
 * | Layer Type | Redraw Interval | Example Content |
 * |------------|-----------------|-----------------|
 * | background | 1000ms+ | Static nebula, gradient |
 * | stars | 16ms (every frame) | Moving stars |
 * | effects | 16ms (every frame) | Particles, explosions |
 * | ui | On change only | Score, labels |
 *
 * ## Performance Considerations
 *
 * - Each layer allocates GPU memory (width × height × 4 bytes for RGBA)
 * - Compositing is fast (single drawImage call per layer)
 * - Pre-rendering saves time only if the content is complex
 * - For the Starfield, stars move every frame, so offscreen canvas
 *   provides minimal benefit unless we cache the render and only update positions
 *
 * ## Browser Support
 *
 * OffscreenCanvas is supported in modern browsers:
 * - Chrome 69+
 * - Firefox 105+
 * - Safari 16.4+
 * - Edge 79+
 *
 * Falls back to regular canvas elements if OffscreenCanvas is unavailable.
 */

import { useCallback, useEffect, useRef } from "react";
import { logger } from "@/utils";
import { featureFlags } from "@/utils";

export interface OffscreenLayer {
  canvas: OffscreenCanvas | HTMLCanvasElement;
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  needsRedraw: boolean;
  lastDrawTime: number;
  redrawInterval: number; // How often to redraw this layer (ms)
}

export interface UseOffscreenCanvasProps {
  width: number;
  height: number;
  layers?: string[]; // Names of layers to create
  enabled?: boolean;
}

export interface UseOffscreenCanvasReturn {
  isSupported: boolean;
  isEnabled: boolean;
  getLayer: (name: string) => OffscreenLayer | null;
  markDirty: (name: string) => void;
  shouldRedraw: (name: string) => boolean;
  compositeToMain: (
    mainCtx: CanvasRenderingContext2D,
    layerName: string,
    x?: number,
    y?: number
  ) => void;
  resize: (width: number, height: number) => void;
  cleanup: () => void;
}

// Check if OffscreenCanvas is supported
const isOffscreenCanvasSupported = (): boolean => {
  try {
    return typeof OffscreenCanvas !== "undefined";
  } catch {
    return false;
  }
};

export const useOffscreenCanvas = ({
  width,
  height,
  layers = ["background", "stars", "effects"],
  enabled = true,
}: UseOffscreenCanvasProps): UseOffscreenCanvasReturn => {
  const layersRef = useRef<Map<string, OffscreenLayer>>(new Map());
  const supportedRef = useRef<boolean>(isOffscreenCanvasSupported());
  const perfLogger = useRef(logger.createChild("OffscreenCanvas"));

  // Check if the feature is enabled via feature flags
  const isFeatureEnabled = enabled && featureFlags.isEnabled("offscreenCanvas");

  // Initialize layers
  useEffect(() => {
    if (!isFeatureEnabled || !supportedRef.current || width <= 0 || height <= 0) {
      return;
    }

    perfLogger.current.debug(`Initializing ${layers.length} offscreen layers at ${width}x${height}`);
    
    // Capture the current value of layersRef for use in the cleanup function
    const currentLayersRef = layersRef.current;

    layers.forEach((name) => {
      try {
        // Try to create OffscreenCanvas, fall back to regular canvas
        let canvas: OffscreenCanvas | HTMLCanvasElement;
        let ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;

        if (supportedRef.current) {
          canvas = new OffscreenCanvas(width, height);
          ctx = canvas.getContext("2d");
        } else {
          canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          ctx = canvas.getContext("2d");
        }

        if (ctx) {
          currentLayersRef.set(name, {
            canvas,
            ctx,
            needsRedraw: true,
            lastDrawTime: 0,
            redrawInterval: name === "background" ? 1000 : 0, // Background updates slowly
          });
          perfLogger.current.debug(`Created layer: ${name}`);
        }
      } catch (err) {
        perfLogger.current.warn(`Failed to create layer ${name}:`, err);
      }
    });

    return (): void => {
      // Cleanup layers using the captured ref value
      currentLayersRef.clear();
    };
  }, [isFeatureEnabled, width, height, layers]);

  const getLayer = useCallback((name: string): OffscreenLayer | null => {
    return layersRef.current.get(name) ?? null;
  }, []);

  const markDirty = useCallback((name: string): void => {
    const layer = layersRef.current.get(name);
    if (layer) {
      layer.needsRedraw = true;
    }
  }, []);

  const shouldRedraw = useCallback((name: string): boolean => {
    const layer = layersRef.current.get(name);
    if (!layer) return false;

    if (layer.needsRedraw) return true;

    // Check if enough time has passed since last redraw
    if (layer.redrawInterval > 0) {
      const now = performance.now();
      if (now - layer.lastDrawTime >= layer.redrawInterval) {
        return true;
      }
    }

    return false;
  }, []);

  const compositeToMain = useCallback((
    mainCtx: CanvasRenderingContext2D,
    layerName: string,
    x = 0,
    y = 0
  ): void => {
    const layer = layersRef.current.get(layerName);
    if (!layer) return;

    try {
      // Draw the offscreen canvas onto the main canvas
      if (layer.canvas instanceof OffscreenCanvas) {
        // For OffscreenCanvas, we need to transfer to ImageBitmap first
        // or use the canvas directly if supported
        mainCtx.drawImage(layer.canvas as unknown as CanvasImageSource, x, y);
      } else {
        mainCtx.drawImage(layer.canvas, x, y);
      }

      // Mark as drawn
      layer.needsRedraw = false;
      layer.lastDrawTime = performance.now();
    } catch (err) {
      perfLogger.current.warn(`Failed to composite layer ${layerName}:`, err);
    }
  }, []);

  const resize = useCallback((newWidth: number, newHeight: number): void => {
    if (newWidth <= 0 || newHeight <= 0) return;

    layersRef.current.forEach((layer, name) => {
      try {
        if (layer.canvas instanceof OffscreenCanvas) {
          layer.canvas.width = newWidth;
          layer.canvas.height = newHeight;
        } else {
          layer.canvas.width = newWidth;
          layer.canvas.height = newHeight;
        }
        layer.needsRedraw = true;
        perfLogger.current.debug(`Resized layer ${name} to ${newWidth}x${newHeight}`);
      } catch (err) {
        perfLogger.current.warn(`Failed to resize layer ${name}:`, err);
      }
    });
  }, []);

  const cleanup = useCallback((): void => {
    layersRef.current.clear();
    perfLogger.current.debug("Cleaned up all offscreen layers");
  }, []);

  return {
    isSupported: supportedRef.current,
    isEnabled: isFeatureEnabled,
    getLayer,
    markDirty,
    shouldRedraw,
    compositeToMain,
    resize,
    cleanup,
  };
};

export default useOffscreenCanvas;
