// theme/types/mappings/component-variants.ts

/**
 * Button Variants
 * Defines interactive states and styles for buttons.
 *
 * @example
 * const primaryButton: ButtonVariant = {
 *   background: { hex: "#007BFF", rgb: "0,123,255", hsl: "210,100%,50%" },
 *   foreground: { hex: "#FFFFFF", rgb: "255,255,255", hsl: "0,0%,100%" },
 *   border: { hex: "#0056b3", rgb: "0,86,179", hsl: "210,100%,35%" },
 *   hover: {
 *     background: { hex: "#0056b3", rgb: "0,86,179", hsl: "210,100%,35%" },
 *     foreground: { hex: "#FFFFFF", rgb: "255,255,255", hsl: "0,0%,100%" }
 *   },
 *   active: {
 *     background: { hex: "#003f7f", rgb: "0,63,127", hsl: "210,100%,25%" },
 *     foreground: { hex: "#FFFFFF", rgb: "255,255,255", hsl: "0,0%,100%" }
 *   }
 * };
 */

import { ColorDefinition } from "../core/colors";
import { ComponentState, InteractiveState } from "./state-mappings";

// Base Color and Component Interfaces
/**
 * Base interface for all component variants
 */
export interface BaseVariant {
  style?: Record<string, string | number>;
}

/**
 * Interface for variants with interactive states
 */
export interface InteractiveVariant extends BaseVariant {
  interactive?: InteractiveState;
}

// Button Variants
export interface ButtonVariant extends InteractiveState {
  style?: Record<string, string | number>;
}

// Input Specific States
export interface InputAddonState {
    background: ColorDefinition;
    foreground: ColorDefinition;
    border?: ColorDefinition;
    style?: Record<string, string | number>;
}

export interface InputValidationState extends ComponentState {
    message: ColorDefinition;
    style?: Record<string, string | number>;
}

export interface InputVariant extends InteractiveVariant {
  readonly: ComponentState;
  error: {
    background: ColorDefinition;
    foreground: ColorDefinition;
    border: ColorDefinition;
    message: ColorDefinition;
    style?: Record<string, string | number>;
  };
  success: {
    background: ColorDefinition;
    foreground: ColorDefinition;
    border: ColorDefinition;
    message: ColorDefinition;
    style?: Record<string, string | number>;
  };
  prefix: {
    background: ColorDefinition;
    foreground: ColorDefinition;
    border?: ColorDefinition;
    style?: Record<string, string | number>;
  };
  suffix: {
    background: ColorDefinition;
    foreground: ColorDefinition;
    border?: ColorDefinition;
    style?: Record<string, string | number>;
  };
  placeholder: ColorDefinition;
  label: ColorDefinition;
}

// Select Specific States
export interface SelectVariant extends InputVariant {
    options: {
        background: ColorDefinition;
        hover: ColorDefinition;
        selected: ColorDefinition;
        style?: Record<string, string | number>;
    };
    dropdown: {
        background: ColorDefinition;
        border: ColorDefinition;
        shadow: ColorDefinition;
        style?: Record<string, string | number>;
    };
}

// Checkbox and Radio Variants
export interface ToggleVariant extends InteractiveState {
    checked: {
        default: ComponentState;
        hover: ComponentState;
        disabled: ComponentState;
        style?: Record<string, string | number>;
    };
    indeterminate?: {
        default: ComponentState;
        hover: ComponentState;
        disabled: ComponentState;
        style?: Record<string, string | number>;
    };
}

// Card Variant
export interface CardVariant {
    default: ComponentState;
    interactive?: {
        hover: ComponentState;
        active: ComponentState;
    };
    header?: ComponentState;
    footer?: ComponentState;
    style?: Record<string, string | number>;
}

// Modal/Dialog Variant
export interface ModalVariant {
    overlay: {
        background: ColorDefinition;
        opacity: ColorDefinition;
    };
    container: ComponentState;
    header: ComponentState;
    footer: ComponentState;
    style?: Record<string, string | number>;
}

// Toast/Notification Variants
export interface ToastVariant extends ComponentState {
    success: ComponentState;
    error: ComponentState;
    warning: ComponentState;
    info: ComponentState;
    style?: Record<string, string | number>;
}

// Tab Variant
export interface TabVariant extends InteractiveVariant {
    selected: ComponentState;
    style?: Record<string, string | number>;
}

// Menu Variant
export interface MenuVariant {
    container: ComponentState;
    item: InteractiveState;
    divider: ColorDefinition;
    group: {
        label: ColorDefinition;
        background: ColorDefinition;
    };
    style?: Record<string, string | number>;
}

// Badge/Tag Variant
export interface BadgeVariant {
    default: ComponentState;
    primary: ComponentState;
    secondary: ComponentState;
    success: ComponentState;
    warning: ComponentState;
    danger: ComponentState;
    info: ComponentState;
    style?: Record<string, string | number>;
}

// Progress Variant
export interface ProgressVariant {
    track: ComponentState;
    indicator: {
        default: ComponentState;
        success: ComponentState;
        error: ComponentState;
    };
    label: ColorDefinition;
    style?: Record<string, string | number>;
}

// Tooltip Variant
export interface TooltipVariant {
    background: ColorDefinition;
    foreground: ColorDefinition;
    arrow: ColorDefinition;
    style?: Record<string, string | number>;
}

// Navigation Variant
export interface NavigationVariant extends InteractiveVariant {
    container: ComponentState;
    item: {
      default: InteractiveState;
      active: ComponentState;
      expanded?: ComponentState;
      style?: Record<string, string | number>;
    };
    subItem?: {
      container: ComponentState;
      item: InteractiveState;
      style?: Record<string, string | number>;
    };
    divider?: ColorDefinition;
    icon?: {
      default: ColorDefinition;
      active: ColorDefinition;
      style?: Record<string, string | number>;
    };
    indicator?: {
      default: ComponentState;
      active: ComponentState;
      style?: Record<string, string | number>;
    };
    mobile?: {
      overlay: {
        background: ColorDefinition;
        opacity: number;
      };
      drawer: ComponentState;
      closeButton: InteractiveState;
      style?: Record<string, string | number>;
    };
  }

  // Table Variant
  export interface TableVariant {
    container: ComponentState;
    header: {
      container: ComponentState;
      cell: ComponentState;
    };
    body: {
      container: ComponentState;
      row: {
        default: ComponentState;
        hover?: ComponentState;
        selected?: ComponentState;
        alternate?: ComponentState; // For striped tables
      };
      cell: ComponentState;
    };
    footer?: {
      container: ComponentState;
      cell: ComponentState;
    };
    pagination?: {
      container: ComponentState;
      button: InteractiveState;
      current: ComponentState;
      text: ColorDefinition;
    };
    sorting?: {
      indicator: {
        default: ComponentState;
        active: ComponentState;
      };
    };
    resizing?: {
      handle: {
        default: ComponentState;
        hover: ComponentState;
        active: ComponentState;
      };
    };
    filter?: {
      container: ComponentState;
      input: InputVariant;
      button: ButtonVariant;
    };
    style?: Record<string, string | number>;
  }

export type ComponentVariantType =
  | ButtonVariant
  | InputVariant
  | SelectVariant
  | ToggleVariant
  | CardVariant
  | ModalVariant
  | NavigationVariant
  | TableVariant
  | ToastVariant
  | TabVariant
  | MenuVariant
  | BadgeVariant
  | ProgressVariant
  | TooltipVariant
  | SidebarVariant;

// Component Collection Interface
export interface ComponentVariants {
    // Core components with predefined variants
    button?: {
      primary: ButtonVariant;
      secondary: ButtonVariant;
      tertiary: ButtonVariant;
      danger: ButtonVariant;
      [key: string]: ButtonVariant; // Allow additional variants
    };
    input?: {
      default: InputVariant;
      [key: string]: InputVariant;
    };
    select?: {
      default: SelectVariant;
      [key: string]: SelectVariant;
    };
    checkbox?: {
      default: ToggleVariant;
      [key: string]: ToggleVariant;
    };
    radio?: {
      default: ToggleVariant;
      [key: string]: ToggleVariant;
    };
    card?: {
      default: CardVariant;
      [key: string]: CardVariant;
    };
    modal?: {
      default: ModalVariant;
      [key: string]: ModalVariant;
    };
    navigation?: {
      default: NavigationVariant;
      [key: string]: NavigationVariant;
    };
    table?: {
      default: TableVariant;
      [key: string]: TableVariant;
    };
    toast?: {
      default: ToastVariant;
      [key: string]: ToastVariant;
    };
    tab?: {
      default: TabVariant;
      [key: string]: TabVariant;
    };
    menu?: {
      default: MenuVariant;
      [key: string]: MenuVariant;
    };
    badge?: {
      default: BadgeVariant;
      [key: string]: BadgeVariant;
    };
    progress?: {
      default: ProgressVariant;
      [key: string]: ProgressVariant;
    };
    sidebar?: {
      default: SidebarVariant;
      [key: string]: SidebarVariant;
    };
    tooltip?: {
      default: TooltipVariant;
      [key: string]: TooltipVariant;
    };

    [key: string]: { [variantKey: string]: ComponentVariantType } | undefined;
  }

  export interface SidebarVariant {
    container: ComponentState;
    group: {
      container: ComponentState;
      title: ComponentState;
      style?: Record<string, string | number>;
    };
    item: {
      default: InteractiveState;
      active: ComponentState;
      style?: Record<string, string | number>;
    };
    divider?: ColorDefinition;
    icon?: {
      default: ColorDefinition;
      active: ColorDefinition;
      style?: Record<string, string | number>;
    };
    style?: Record<string, string | number>;
  }

/**
 * Type guard functions to check variant types
 */
export const isInteractiveVariant = (variant: ComponentVariantType): variant is InteractiveVariant & ComponentVariantType => {
  return "interactive" in variant && variant.interactive !== undefined;
};

export const isNavigationVariant = (variant: ComponentVariantType): variant is NavigationVariant => {
  return "item" in variant && variant.item !== undefined &&
         "default" in variant.item && variant.item.active !== undefined;
};

export const isTabVariant = (variant: ComponentVariantType): variant is TabVariant => {
  return "selected" in variant && variant.selected !== undefined;
};

export const isInputVariant = (variant: ComponentVariantType): variant is InputVariant => {
  return "readonly" in variant && "error" in variant && "success" in variant;
};

export const isSidebarVariant = (variant: ComponentVariantType): variant is SidebarVariant => {
  return "container" in variant &&
         "group" in variant &&
         "item" in variant &&
         typeof variant.group === "object" &&
         "title" in variant.group;
};
