// /theme/types/context/state.ts
import { ThemeState } from "../core";
import { ThemeContextError } from "./error";

/**
 * Extend the core ThemeState to add context-specific state properties.
 */
export interface ExtendedThemeState extends Required<ThemeState> {

    // Context-specific additions:
    isLoading?: boolean;
    error?: Error | null;
}


/**
 * Theme context state interface.
 * Composes the extended core ThemeState with additional context flags.
 */
export interface ThemeContextState {
  theme: ExtendedThemeState;
  error: ThemeContextError | null;
  isLoading: boolean;
  isInitialized: boolean;
}
