import {
  ColorDefinition,
  ShadowProperties,
  SemanticColors,
} from "../core/colors";

/**
 * Base Component Colors
 */
export interface ComponentColorSet {
  background: ColorDefinition;
  text: ColorDefinition;
  border: ColorDefinition;
  shadow?: ShadowProperties;
}

/**
 * Interactive Component States
 */
export interface InteractiveComponentSet extends ComponentColorSet {
  hover: ComponentColorSet;
  active: ComponentColorSet;
  focus?: ComponentColorSet;
  disabled?: ComponentColorSet;
}

/**
 * Input Component Base Colors
 */
export interface InputColorSet extends InteractiveComponentSet {
  placeholder: ColorDefinition;
  error: ComponentColorSet;
  success: ComponentColorSet;
}

/**
 * Button Component Base Colors
 */
export interface ButtonColorSet extends InteractiveComponentSet {
  loading: ComponentColorSet;
}

/**
 * Typography Color Set
 */
export interface TextColorSet {
  primary: ColorDefinition;
  secondary: ColorDefinition;
  muted: ColorDefinition;
  disabled: ColorDefinition;
  inverse: ColorDefinition;
  link: {
    default: ColorDefinition;
    hover: ColorDefinition;
    visited: ColorDefinition;
    active: ColorDefinition;
  };
  emphasis: {
    strong: ColorDefinition;
    weak: ColorDefinition;
  };
}

/**
 * Border Color Set
 */
export interface BorderColorSet {
  default: ColorDefinition;
  hover: ColorDefinition;
  focus: ColorDefinition;
  active: ColorDefinition;
  disabled: ColorDefinition;
  error: ColorDefinition;
  success: ColorDefinition;
  warning: ColorDefinition;
  divider: ColorDefinition;
  subtle: ColorDefinition;
}

/**
 * Table Component Base Colors
 */
export interface TableColorSet extends ComponentColorSet {
  header: {
    background: ColorDefinition;
    text: ColorDefinition;
  };
  row: {
    even: ColorDefinition;
    odd: ColorDefinition;
    hover: ColorDefinition;
    selected: ColorDefinition;
  };
  cell: {
    border: ColorDefinition;
  };
}

/**
 * Chart Component Base Colors
 */
export interface ChartColorSet {
  background: ColorDefinition;
  grid: {
    main: ColorDefinition;
  };
  axis: {
    main: ColorDefinition;
  };
  text: ColorDefinition;
  series: ColorDefinition[];
  tooltip: {
    background: ColorDefinition;
    text: ColorDefinition;
    border: ColorDefinition;
  };
}

/**
 * Navigation Component Base Colors
 */
export interface NavigationColorSet extends ComponentColorSet {
  active: ComponentColorSet;
  inactive: ComponentColorSet;
  indicator?: ComponentColorSet;
}

/**
 * Container Component Base Colors
 */
export interface ContainerColorSet extends ComponentColorSet {
  overlay?: ColorDefinition;
}

/**
 * Modal Component Base Colors
 */
export interface ModalColorSet extends ContainerColorSet {
  backdrop: ColorDefinition;
}

/**
 * Drawer Component Base Colors
 */
export interface DrawerColorSet extends ContainerColorSet {
  scrim: ColorDefinition;
}

/**
 * Feedback Component Colors
 */
export interface FeedbackColorSet {
  alert: Record<keyof SemanticColors, ComponentColorSet>;
  toast: Record<keyof SemanticColors, ComponentColorSet>;
  progress: ComponentColorSet;
  spinner: ComponentColorSet;
}

/**
 * Code Component Colors
 */
export interface CodeColorSet extends ComponentColorSet {
  syntax: {
    comment: string;
    string: string;
    keyword: string;
    variable: string;
    function: string;
    operator: string;
    class: string;
  };
}

/**
 * Interactive States for Components
 * This interface is used in the higher–level component definitions (in components.ts)
 * to represent interactive behavior.
 */
export interface InteractiveStates extends InteractiveComponentSet {
  // You can add additional interactive properties here if needed.
}
