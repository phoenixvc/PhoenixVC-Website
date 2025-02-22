// // theme.types.ts

// // ============================================
// // Basic Types & Enums
// // ============================================

// /**
//  * Available color schemes for the theme
//  * @description Predefined color schemes available in the application
//  */
// export type ColorScheme = "classic" | "forest" | "ocean" | "phoenix" | "lavender" | "cloud";

// /**
//  * Theme modes (light/dark)
//  * @description Available theme modes for the application
//  */
// export type Mode = 'light' | 'dark';

// /**
//  * Theme error types
//  * @description Possible theme-related errors
//  */
// export type ThemeError = 
//     | 'INVALID_SCHEME' 
//     | 'INVALID_MODE' 
//     | 'STORAGE_ERROR' 
//     | 'INITIALIZATION_ERROR';

// /**
//  * Theme event types
//  * @description Custom events for theme changes
//  */
// export type ThemeEventType = 
//     | 'theme:init'
//     | 'theme:change'
//     | 'theme:mode-change'
//     | 'theme:scheme-change'
//     | 'theme:system-change';

// /**
//  * Theme class suffixes
//  * @description Available suffixes for theme-based class names
//  */
// export type ThemeClassSuffix = 
//     | 'primary'
//     | 'secondary'
//     | 'text'
//     | 'active-text'
//     | 'hover-bg'
//     | 'active-bg'
//     | 'mobile-menu'
//     | 'bg-mobile-menu'
//     | 'border';

// // ============================================
// // Base Color Sets
// // ============================================

// /**
//  * Base color set
//  * @description Core interactive color states
//  */
// export interface ColorSet {
//     default: string;
//     hover: string;
//     active: string;
//     focus: string;
// }

// /**
//  * Semantic color set
//  * @description Color variations for semantic meaning
//  */
// export interface SemanticColorSet {
//     default: string;
//     light: string;
//     dark: string;
//     text: string;
//     border: string;
// }

// /**
//  * Interactive state set
//  * @description Complete set of interactive states
//  */
// export interface InteractiveStateSet {
//     default: string;
//     hover: string;
//     active: string;
//     focus: string;
//     disabled: string;
// }

// /**
//  * Base colors interface
//  * @description Core theme colors
//  */
// export interface BaseColors {
//     primary: string;
//     secondary: string;
//     accent: string;
//     background: string;
//     surface: string;
// }

// /**
//  * Extended theme colors
//  * @description Additional color variations for specific use cases
//  */
// export interface ExtendedThemeColors extends BaseColors {
//     primaryHover: string;
//     primaryActive: string;
//     secondaryHover: string;
//     secondaryActive: string;
//     success: string;
//     warning: string;
//     error: string;
//     info: string;
// }

// /**
//  * Semantic colors interface
//  * @description Colors with semantic meaning
//  */
// export interface SemanticColors {
//     success: string;
//     warning: string;
//     error: string;
//     info: string;
// }

// // ============================================
// // Component Color Sets
// // ============================================

// /**
//  * Base component color set
//  * @description Basic colors for components
//  */
// export interface ComponentColorSet {
//     background: string;
//     text: string;
//     border: string;
//     shadow?: string;
// }

// /**
//  * Interactive component set
//  * @description Extended component set with interactive states
//  */
// export interface InteractiveComponentSet extends ComponentColorSet {
//     hover: ComponentColorSet;
//     active: ComponentColorSet;
//     disabled: ComponentColorSet;
// }

// /**
//  * Input color set
//  * @description Colors for form input components
//  */
// export interface InputColorSet extends InteractiveComponentSet {
//     placeholder: string;
//     error: ComponentColorSet;
//     success: ComponentColorSet;
// }

// /**
//  * Button color set
//  * @description Colors for button components
//  */
// export interface ButtonColorSet extends InteractiveComponentSet {
//     loading: ComponentColorSet;
// }

// /**
//  * Text color set
//  * @description Comprehensive text color variations
//  */
// export interface TextColorSet {
//     primary: string;
//     secondary: string;
//     muted: string;
//     disabled: string;
//     inverse: string;
//     link: {
//         default: string;
//         hover: string;
//         visited: string;
//         active: string;
//     };
//     emphasis: {
//         strong: string;
//         weak: string;
//     };
// }

// /**
//  * Border set
//  * @description Border color variations
//  */
// export interface BorderSet {
//     default: string;
//     hover: string;
//     focus: string;
//     active: string;
//     disabled: string;
//     error: string;
//     success: string;
//     warning: string;
//     divider: string;
//     subtle: string;
// }

// /**
//  * Shadow set
//  * @description Shadow variations for elevation
//  */
// export interface ShadowSet {
//     small: string;
//     medium: string;
//     large: string;
//     focus: string;
//     hover: string;
//     inner: string;
//     outline: string;
//     ambient: string;
//     layered: {
//         top: string;
//         middle: string;
//         bottom: string;
//     };
// }

// /**
//  * Navigation color set
//  * @description Colors for navigation components
//  */
// export interface NavigationColorSet extends ComponentColorSet {
//     active: ComponentColorSet;
//     hover: ComponentColorSet;
//     inactive: ComponentColorSet;
    
//     indicator: {
//         active: string;
//         hover: string;
//     };
    
//     icon: {
//         default: string;
//         active: string;
//         hover: string;
//         disabled: string;
//     };
    
//     badge: {
//         background: string;
//         text: string;
//     };
    
//     dropdown: {
//         background: string;
//         itemHover: string;
//         itemActive: string;
//         divider: string;
//         shadow: string;
//     };
    
//     mobile: {
//         background: string;
//         overlay: string;
//         hamburger: string;
//     };
// }

// /**
//  * Table color set
//  * @description Colors for table components
//  */
// export interface TableColorSet {
//     header: ComponentColorSet;
//     row: ComponentColorSet;
//     rowAlternate: ComponentColorSet;
//     border: string;
//     hover: ComponentColorSet;
//     selected: ComponentColorSet;
// }

// /**
//  * Chart color set
//  * @description Colors for chart components
//  */
// export interface ChartColorSet {
//     primary: string[];
//     secondary: string[];
//     accent: string[];
//     grid: string;
//     axis: string;
//     labels: string;
//     tooltip: ComponentColorSet;
//     legend: ComponentColorSet;
// }

// // ============================================
// // Theme Configuration & State
// // ============================================

// /**
//  * Theme configuration
//  * @description Basic theme configuration options
//  */
// export interface ThemeConfig {
//   colorScheme: ColorScheme;
//   mode: Mode;
//   useSystem: boolean;
// }

// /**
// * Theme initialization options
// * @description Complete set of theme initialization parameters
// */
// export interface ThemeInitOptions {
//   defaultScheme?: ColorScheme;
//   defaultMode?: Mode;
//   useSystem?: boolean;
//   storage?: ThemeStorage;
//   transition?: ThemeTransition;
// }

// /**
// * Theme state
// * @description Current theme state with all properties
// */
// export interface ThemeState extends Required<ThemeConfig> {
//   systemMode: Mode;
//   initialized: boolean;
// }

// /**
// * Theme storage configuration
// * @description Storage keys and preferences
// */
// export interface ThemeStorage {
//   colorSchemeKey: string;
//   modeKey: string;
//   useSystemKey: string;
//   prefix: string;
// }

// /**
// * Theme transition configuration
// * @description Animation settings for theme changes
// */
// export interface ThemeTransition {
//   duration: number;
//   timing: string;
//   properties: string[];
// }

// // ============================================
// // Color Mappings & Variables
// // ============================================

// /**
// * Complete color mappings
// * @description Comprehensive color definitions for the entire theme
// */
// export interface ColorMappings {
//   base: Record<keyof BaseColors, ColorSet>;
//   semantic: Record<keyof SemanticColors, SemanticColorSet>;
//   text: TextColorSet;
//   border: BorderSet;
//   shadow: ShadowSet;

//   interactive: {
//       focusRing: string;
//       overlay: string;
//       selection: string;
//       highlight: string;
//   };

//   components: {
//       // Form Elements
//       input: InputColorSet;
//       select: InputColorSet;
//       checkbox: InputColorSet;
//       radio: InputColorSet;
//       switch: InputColorSet;
      
//       // Buttons
//       button: Record<'primary' | 'secondary' | 'ghost' | 'link' | 'danger', ButtonColorSet>;

//       // Navigation
//       navbar: NavigationColorSet;
//       sidebar: NavigationColorSet;
//       tab: NavigationColorSet;
//       breadcrumb: NavigationColorSet;

//       // Containers
//       card: ComponentColorSet;
//       modal: ComponentColorSet & {
//           overlay: string;
//       };
//       drawer: ComponentColorSet;
//       popover: ComponentColorSet;
//       tooltip: ComponentColorSet;

//       // Feedback
//       alert: Record<keyof SemanticColors, ComponentColorSet>;
//       toast: Record<keyof SemanticColors, ComponentColorSet>;

//       // Data Display
//       table: TableColorSet;
//       badge: ComponentColorSet;
//       tag: ComponentColorSet;
//       avatar: ComponentColorSet;
//       progress: ComponentColorSet;
//       spinner: ComponentColorSet;

//       // Code and Syntax
//       code: ComponentColorSet & {
//           syntax: {
//               comment: string;
//               string: string;
//               keyword: string;
//               variable: string;
//               function: string;
//               operator: string;
//               class: string;
//           };
//       };

//       // Charts and Visualization
//       chart: ChartColorSet;

//       // Skeleton Loading
//       skeleton: {
//           base: string;
//           highlight: string;
//           animation: string;
//       };

//       // Scrollbar
//       scrollbar: {
//           track: string;
//           thumb: string;
//           thumbHover: string;
//       };
//   };

//   // States
//   states: {
//       disabled: ComponentColorSet;
//       loading: ComponentColorSet;
//       readonly: ComponentColorSet;
//   };
// }

// /**
// * Theme variables
// * @description Complete set of theme variables including computed values
// */
// export interface ThemeVariables {
//   prefix: string;
//   mappings: ColorMappings;
//   computed: {
//       color: ColorMappings;
//       spacing: Record<string, string>;
//       typography: Record<string, {
//           fontSize: string;
//           lineHeight: string;
//           fontWeight: number;
//           letterSpacing?: string;
//       }>;
//       breakpoints: Record<string, string>;
//       animation: Record<string, {
//           duration: string;
//           easing: string;
//       }>;
//       zIndex: Record<string, number>;
//   };
// }

// // ============================================
// // Theme Context & Events
// // ============================================

// /**
// * Theme context type
// * @description Complete theme context with all methods and properties
// */
// export interface ThemeContextType {
//   // Current state
//   colorScheme: ColorScheme;
//   mode: Mode;
//   systemMode: Mode;
//   useSystemMode: boolean;

//   // Classes
//   colorSchemeClasses: ColorSchemeClasses;
//   getColorSchemeClasses: (scheme: ColorScheme) => ColorSchemeClasses;
//   getSpecificClass: (suffix: ThemeClassSuffix) => string;
//   replaceColorSchemeClasses: (currentClasses: string, newScheme: ColorScheme) => string;

//   // Actions
//   setColorScheme: (scheme: ColorScheme) => void;
//   setMode: (mode: Mode) => void;
//   toggleMode: () => void;
//   setUseSystemMode: (useSystem: boolean) => void;

//   // Utilities
//   getCssVariable: (name: string) => string;
//   getAllThemeClasses: () => Record<ColorScheme, ColorSchemeClasses>;
//   isColorSchemeClass: (className: string) => boolean;
// }

// /**
// * Theme event payload
// * @description Data structure for theme change events
// */
// export interface ThemeEventPayload {
//   type: ThemeEventType;
//   theme: ThemeState;
//   timestamp: number;
// }

// /**
// * Theme provider props
// * @description Props for the ThemeProvider component
// */
// export interface ThemeProviderProps {
//   children: React.ReactNode;
//   initialConfig?: Partial<ThemeConfig>;
//   onThemeChange?: (state: ThemeState) => void;
//   onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
//   errorFallback?: React.ReactNode;
// }

// /**
// * Color scheme classes
// * @description Class name mappings for color schemes
// */
// export interface ColorSchemeClasses {
//   primary: string;
//   secondary: string;
//   text: string;
//   activeText: string;
//   hoverBg: string;
//   activeBg: string;
//   mobileMenu: string;
//   bgMobileMenu: string;
//   border: string;
// }

// // ============================================
// // Style Configurations
// // ============================================

// /**
// * Hover styles
// * @description Style definitions for hover states
// */
// export interface HoverStyles {
//   backgroundColor?: string;
//   color?: string;
//   borderColor?: string;
//   [key: string]: string | undefined;
// }

// /**
// * Computed styles
// * @description Combined style configurations
// */
// export interface ComputedStyles {
//   hover: HoverStyles;
//   semantic: SemanticColors;
//   interactive: InteractiveStateSet;
// }

// // ============================================
// // Style Configurations & CSS Variables
// // ============================================

// /**
//  * CSS variable mapping interface
//  * @description Maps theme colors to CSS custom properties
//  */
// export interface CSSVariableMappings {
//   [key: string]: string;
// }

// /**
// * Raw style definitions
// * @description Basic style definitions without processing
// */
// export interface RawStyles {
//   [key: string]: string | RawStyles;
// }

// /**
// * Hover state styles
// * @description Style definitions for hover states
// */
// export interface HoverStyles {
//   backgroundColor?: string;
//   color?: string;
//   borderColor?: string;
//   opacity?: string;
//   transform?: string;
//   boxShadow?: string;
//   [key: string]: string | undefined;
// }

// /**
// * Semantic color styles
// * @description Color definitions for semantic meanings
// */
// export interface SemanticStyles {
//   success: string;
//   warning: string;
//   error: string;
//   info: string;
//   [key: string]: string;
// }

// /**
// * Interactive element styles
// * @description Style definitions for interactive elements
// */
// export interface InteractiveStyles {
//   hover: string;
//   active: string;
//   focus: string;
//   disabled: string;
//   [key: string]: string;
// }

// /**
// * Computed styles configuration
// * @description Combined style configurations with extended functionality
// */
// export interface ComputedStyles {
//   hover: HoverStyles;
//   semantic: SemanticStyles;
//   interactive: InteractiveStyles;
//   variables: CSSVariableMappings;
//   raw: RawStyles;
// }

// /**
// * Style generation options
// * @description Options for generating computed styles
// */
// export interface StyleGenerationOptions {
//   prefix?: string;
//   scope?: string;
//   important?: boolean;
//   format?: 'css' | 'json' | 'object';
// }

// /**
// * Style processing result
// * @description Result of style processing operations
// */
// export interface StyleProcessingResult {
//   css: string;
//   variables: CSSVariableMappings;
//   classNames: string[];
//   dependencies: Set<string>;
// }
