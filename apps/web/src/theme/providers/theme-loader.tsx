import { ThemeColors, ThemeColorScheme } from "@/theme/types";
import { validateTheme } from "./validation";

const CACHE_DURATION: number = 1000 * 60 * 5; // 5 minutes
const API_BASE_URL = '/api/themes' as const;

// Define the cache entry type
type ThemeCacheEntry = {
  theme: ThemeColors;
  timestamp: number;
};

// Create the Map with proper typing
const themeCache = new Map<ThemeColorScheme, ThemeCacheEntry>();

export const loadTheme = async (
  colorScheme: ThemeColorScheme
): Promise<ThemeColors> => {
  // Check cache first
  const cached = themeCache.get(colorScheme);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.theme;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${colorScheme}`);
    if (!response.ok) {
      throw new Error(`Failed to load theme: ${response.statusText}`);
    }

    // Try to get JSON directly instead of parsing text
    let theme: ThemeColors;
    try {
      theme = await response.json();
    } catch (error) {
      throw new Error(
        `Invalid theme JSON: ${error instanceof Error ? error.message : 'Unknown parsing error'}`
      );
    }

    // Validate theme before caching
    validateTheme(theme);

    // Update cache
    themeCache.set(colorScheme, {
      theme,
      timestamp: Date.now(),
    });

    return theme;
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred while loading theme';
    console.error('Error loading theme:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const preloadTheme = async (colorScheme: ThemeColorScheme): Promise<void> => {
  try {
    await loadTheme(colorScheme);
  } catch (error) {
    console.error('Failed to preload theme:', error);
  }
};

export const clearThemeCache = (): void => {
  themeCache.clear();
};

export const isThemeCached = (colorScheme: ThemeColorScheme): boolean => {
  const cached = themeCache.get(colorScheme);
  return Boolean(cached && Date.now() - cached.timestamp < CACHE_DURATION);
};

export const getCacheStatus = (): {
  size: number;
  schemes: ThemeColorScheme[];
} => {
  return {
    size: themeCache.size,
    schemes: Array.from(themeCache.keys())
  };
};
