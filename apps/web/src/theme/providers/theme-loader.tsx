import { SemanticColors, ThemeColors, ThemeName, ThemeMode, ThemeSchemeInitial } from "@/theme/types";
import { isValidThemeName } from "./theme-validation";
import { THEME_CONSTANTS } from "../constants";
import { transformTheme } from "./theme-transformer";
import { ProcessedThemeValidation, SemanticColorValidation } from "./validation";
import { validateInitialTheme } from "./validation/theme-initial-validation";

export interface ThemeLoaderConfig {
  source: "static" | "api";
  themePath?: string;
  apiBaseUrl?: string;
  cacheDuration: number;
}

const DEFAULT_CONFIG: ThemeLoaderConfig = {
  source: "static",
  themePath: "/themes",
  apiBaseUrl: "/api/themes",
  cacheDuration: 1000 * 60 * 5 // 5 minutes
};

type ThemeCacheEntry = {
  theme: ThemeColors;
  timestamp: number;
};

const themeCache = new Map<ThemeName, ThemeCacheEntry>();

export function processTheme(
  themeData: ThemeSchemeInitial & { semantic?: SemanticColors },
  mode: ThemeMode = THEME_CONSTANTS.DEFAULTS.MODE
): ThemeColors {
  console.groupCollapsed("[processTheme]");

  // 1) Validate the initial structure
  validateInitialTheme(themeData);

  // 2) Log whether we found semantic
  if (themeData.semantic) {
    console.log("[processTheme] Found semantic colors in initial theme:", themeData.semantic);
  } else {
    console.log("[processTheme] No semantic colors found in initial theme.");
  }

  // 3) Build a partial object that includes semantic
  //    So transformTheme can optionally transform them if it supports that
  const rawTheme = {
    base: themeData.base,
    light: themeData.light,
    dark: themeData.dark,
    semantic: themeData.semantic, // Provide semantic so transformTheme can see it
  };

  // 4) Transform the theme, including semantic if transformTheme is set up to handle it
  //    If transformTheme doesn't handle semantic logic, we can still pass it so we can handle it later
  console.log("[processTheme] Passing combined data to transformTheme:", rawTheme);
  const transformed = transformTheme(rawTheme, mode, rawTheme.semantic);

  // 5) Validate the final, fully processed theme
  ProcessedThemeValidation.validateProcessedTheme(transformed.schemes);
  if (transformed.semantic) {
    SemanticColorValidation.validateSemanticColors(transformed.semantic);
  }

  console.log("[processTheme] Final transformed theme:", transformed);
  console.groupEnd();

  return transformed;
}

// Helper to get effective color scheme with fallback to default
function getEffectiveColorScheme(colorScheme?: ThemeName): ThemeName {
  if (!colorScheme) {
    return THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME;
  }

  if (!isValidThemeName(colorScheme)) {
    console.warn(
      `Color scheme "${colorScheme}" not found in available schemes. ` +
      `Falling back to default: "${THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME}"`
    );
    return THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME;
  }

  return colorScheme;
}

export const loadTheme = async (
  colorScheme?: ThemeName,
  config: Partial<ThemeLoaderConfig> = {}
): Promise<ThemeColors> => {
  console.groupCollapsed(`[loadTheme] colorScheme: "${colorScheme || "undefined"}"`);

  const effectiveColorScheme = getEffectiveColorScheme(colorScheme);
  const effectiveConfig = { ...DEFAULT_CONFIG, ...config };

  // Check cache first
  const cached = themeCache.get(effectiveColorScheme);
  if (cached?.timestamp && (Date.now() - cached.timestamp < effectiveConfig.cacheDuration)) {
    console.log(`[loadTheme] Returning cached theme for "${effectiveColorScheme}".`);
    console.log("[loadTheme] Cached theme object:", cached.theme);
    console.groupEnd();
    return cached.theme;
  }

  try {
    console.log(`[loadTheme] Attempting to load theme for "${effectiveColorScheme}"`);
    let rawTheme: ThemeSchemeInitial & { semantic?: SemanticColors };

    // Load theme data (either from constants or external source)
    if (effectiveColorScheme === THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME) {
      const defaultScheme = THEME_CONSTANTS.COLORS.schemes[THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME];
      const semanticColors = THEME_CONSTANTS.COLORS.semantic;

      if (!defaultScheme) {
        console.error("Default theme scheme is missing.");
        console.groupEnd();
        throw new Error("Default theme scheme is missing");
      }

      // Combine scheme with semantic colors if available
      rawTheme = {
        ...defaultScheme,
        ...(semanticColors && { semantic: semanticColors }),
      };
      console.log("[loadTheme] Using default scheme from THEME_CONSTANTS:", {
        defaultScheme,
        semanticColors,
      });
    } else {
      // Load from external source
      rawTheme = await loadThemeFromSource(effectiveColorScheme, effectiveConfig);
      console.log("[loadTheme] Loaded theme from external source:", rawTheme);
    }

    // Validate initial theme structure
    console.log("[loadTheme] Validating initial theme structure...");
    validateInitialTheme(rawTheme);

    // Process theme consistently regardless of source
    console.log("[loadTheme] Processing theme data...");
    const processedTheme = processTheme(rawTheme);

    // Cache the processed theme
    themeCache.set(effectiveColorScheme, {
      theme: processedTheme,
      timestamp: Date.now(),
    });

    console.log("[loadTheme] Final processed theme:", processedTheme);
    console.groupEnd();
    return processedTheme;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred while loading theme";
    console.error("[loadTheme] Error loading theme:", errorMessage);
    console.groupEnd();

    if (effectiveColorScheme !== THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME) {
      console.warn(
        `[loadTheme] Falling back to default theme: ${THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME}`
      );
      return loadTheme(THEME_CONSTANTS.DEFAULTS.COLOR_SCHEME, config);
    }

    throw error instanceof Error ? error : new Error(errorMessage);
  }
};

const loadThemeFromSource = async (
  colorScheme: ThemeName,
  config: ThemeLoaderConfig
): Promise<ThemeSchemeInitial & { semantic?: SemanticColors }> => {
  let rawTheme: ThemeSchemeInitial & { semantic?: SemanticColors };

  if (config.source === "static") {
    if (!config.themePath) {
      throw new Error("Theme path is required for static theme loading");
    }
    rawTheme = await loadStaticTheme(colorScheme, config.themePath);
  } else {
    if (!config.apiBaseUrl) {
      throw new Error("API base URL is required for API theme loading");
    }
    rawTheme = await loadApiTheme(colorScheme, config.apiBaseUrl);
  }

  // Validate the loaded theme structure before returning
  validateInitialTheme(rawTheme);

  return rawTheme;
};

const loadStaticTheme = async (
  colorScheme: ThemeName,
  themePath: string
): Promise<ThemeSchemeInitial & { semantic?: SemanticColors }> => {
  try {
    const response = await fetch(`${themePath}/${colorScheme}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load theme: ${response.statusText}`);
    }

    const theme: unknown = await response.json();

    // Type guard to ensure the loaded data matches our expected structure
    if (!isThemeSchemeInitial(theme)) {
      throw new Error("Invalid theme structure in static file");
    }

    // Validate the initial theme structure
    validateInitialTheme(theme);

    return theme;
  } catch (error) {
    if (error instanceof Error) {
      throw error; // Preserve original error
    }
    throw new Error("Error loading static theme: Unknown error");
  }
};

const loadApiTheme = async (
  colorScheme: ThemeName,
  apiBaseUrl: string
): Promise<ThemeSchemeInitial & { semantic?: SemanticColors }> => {
  try {
    const response = await fetch(`${apiBaseUrl}/${colorScheme}`);
    if (!response.ok) {
      throw new Error(`Failed to load theme: ${response.statusText}`);
    }

    const theme: unknown = await response.json();

    // Type guard to ensure the loaded data matches our expected structure
    if (!isThemeSchemeInitial(theme)) {
      throw new Error("Invalid theme structure in API response");
    }

    // Validate the initial theme structure
    validateInitialTheme(theme);

    return theme;
  } catch (error) {
    if (error instanceof Error) {
      throw error; // Preserve original error
    }
    throw new Error("Error loading API theme: Unknown error");
  }
};

// Type guard function to verify the theme structure
const isThemeSchemeInitial = (theme: unknown): theme is ThemeSchemeInitial & { semantic?: SemanticColors } => {
  if (!theme || typeof theme !== "object" || theme === null) {
    return false;
  }

  const themeObj = theme as Record<string, unknown>;

  // Check for required properties existence and type
  const hasBase = "base" in themeObj &&
    themeObj.base !== null &&
    typeof themeObj.base === "object";

  const hasLight = "light" in themeObj &&
    themeObj.light !== null &&
    typeof themeObj.light === "object";

  const hasDark = "dark" in themeObj &&
    themeObj.dark !== null &&
    typeof themeObj.dark === "object";

  // Semantic colors are optional but must be an object if present
  const hasValidSemantic = !("semantic" in themeObj) ||
    (themeObj.semantic !== null &&
    typeof themeObj.semantic === "object");

  return Boolean(hasBase && hasLight && hasDark && hasValidSemantic);
};

// Cache management utilities
export const preloadTheme = async (
  colorScheme: ThemeName,
  config?: Partial<ThemeLoaderConfig>
): Promise<void> => {
  try {
    await loadTheme(colorScheme, config);
  } catch (error) {
    console.error("Failed to preload theme:", error);
  }
};

export const clearThemeCache = (): void => {
  themeCache.clear();
};

export const isThemeCached = (colorScheme: ThemeName): boolean => {
  const cached = themeCache.get(colorScheme);
  return Boolean(cached && Date.now() - cached.timestamp < DEFAULT_CONFIG.cacheDuration);
};

export const getCacheStatus = (): {
  size: number;
  schemes: ThemeName[];
} => {
  return {
    size: themeCache.size,
    schemes: Array.from(themeCache.keys())
  };
};
