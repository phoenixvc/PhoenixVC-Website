import { ThemeColors, ThemeColorScheme } from "@/theme/types";
import { validateTheme } from "./validation";
import fs from 'fs/promises';
import path from 'path';

export interface ThemeLoaderConfig {
  source: 'local' | 'url';
  localPath?: string;
  apiBaseUrl?: string;
  cacheDuration: number; // Make this required and explicitly a number
}

const DEFAULT_CONFIG: ThemeLoaderConfig = {
  source: 'local',
  localPath: path.join(process.cwd(), 'themes'),
  apiBaseUrl: '/api/themes',
  cacheDuration: 1000 * 60 * 5 // 5 minutes
};

// Define the cache entry type
type ThemeCacheEntry = {
  theme: ThemeColors;
  timestamp: number;
};

// Create the Map with proper typing
const themeCache = new Map<ThemeColorScheme, ThemeCacheEntry>();

const loadLocalTheme = async (
  colorScheme: ThemeColorScheme,
  localPath: string
): Promise<ThemeColors> => {
  try {
    const filePath = path.join(localPath, `${colorScheme}.json`);
    const themeData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(themeData);
  } catch (error) {
    throw new Error(
      `Failed to load local theme '${colorScheme}': ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

const loadUrlTheme = async (
  colorScheme: ThemeColorScheme,
  apiBaseUrl: string
): Promise<ThemeColors> => {
  const response = await fetch(`${apiBaseUrl}/${colorScheme}`);
  if (!response.ok) {
    throw new Error(`Failed to load theme: ${response.statusText}`);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error(
      `Invalid theme JSON: ${error instanceof Error ? error.message : 'Unknown parsing error'}`
    );
  }
};

export const loadTheme = async (
  colorScheme: ThemeColorScheme,
  config: Partial<ThemeLoaderConfig> = {}
): Promise<ThemeColors> => {
  const effectiveCacheDuration = config.cacheDuration ?? DEFAULT_CONFIG.cacheDuration;

  const cached = themeCache.get(colorScheme);
  if (cached?.timestamp && (Date.now() - cached.timestamp < effectiveCacheDuration)) {
    return cached.theme;
  }

  try {
    let theme: ThemeColors;

    if (config.source === 'local') {
      if (!config.localPath) {
        throw new Error('Local path is required for local theme loading');
      }
      theme = await loadLocalTheme(colorScheme, config.localPath);
    } else {
      if (!config.apiBaseUrl) {
        throw new Error('API base URL is required for URL theme loading');
      }
      theme = await loadUrlTheme(colorScheme, config.apiBaseUrl);
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

export const preloadTheme = async (
  colorScheme: ThemeColorScheme,
  config?: Partial<ThemeLoaderConfig>
): Promise<void> => {
  try {
    await loadTheme(colorScheme, config);
  } catch (error) {
    console.error('Failed to preload theme:', error);
  }
};

export const clearThemeCache = (): void => {
  themeCache.clear();
};

export const isThemeCached = (colorScheme: ThemeColorScheme): boolean => {
  const cached = themeCache.get(colorScheme);
  return Boolean(cached && Date.now() - cached.timestamp < DEFAULT_CONFIG.cacheDuration);
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
