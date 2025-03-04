// // Core token types
// export type TokenValue = string | number | Record<string, unknown>;

// export interface DesignTokens {
//   colors: Record<string, TokenValue>;
//   typography: Record<string, TokenValue>;
//   spacing: Record<string, TokenValue>;
//   shadows: Record<string, TokenValue>;
// }

// // Modes
// export type Mode = "light" | "dark";

// // Theme configuration
// export interface ThemeConfig {
//   name: string;
//   tokens: DesignTokens;
//   modes: Record<Mode, Partial<DesignTokens>>; // Mode-specific overrides
// }

// // Component configuration
// export interface ComponentConfig {
//   base: Record<string, TokenValue>; // Base styles
//   variants?: Record<string, Record<string, TokenValue>>; // Variants (e.g., primary, secondary)
//   states?: Record<string, Record<string, TokenValue>>; // States (e.g., hover, active)
// }
