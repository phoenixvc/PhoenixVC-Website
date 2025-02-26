// theme/types/mappings/component-variants.ts

/**
 * Button Variants
 * Defines interactive states and styles for buttons.
 *
 * @example
 * const primaryButton: ButtonVariant = {
 *   background: { hex: '#007BFF', rgb: '0,123,255', hsl: '210,100%,50%' },
 *   foreground: { hex: '#FFFFFF', rgb: '255,255,255', hsl: '0,0%,100%' },
 *   border: { hex: '#0056b3', rgb: '0,86,179', hsl: '210,100%,35%' },
 *   hover: {
 *     background: { hex: '#0056b3', rgb: '0,86,179', hsl: '210,100%,35%' },
 *     foreground: { hex: '#FFFFFF', rgb: '255,255,255', hsl: '0,0%,100%' }
 *   },
 *   active: {
 *     background: { hex: '#003f7f', rgb: '0,63,127', hsl: '210,100%,25%' },
 *     foreground: { hex: '#FFFFFF', rgb: '255,255,255', hsl: '0,0%,100%' }
 *   }
 * };
 */

import { ColorDefinition } from "../core/colors";
import { ComponentState, InteractiveState } from "./state-mappings";

// Base Color and Component Interfaces


// Button Variants
export interface ButtonVariant extends InteractiveState {}

// Input Specific States
export interface InputAddonState {
    background: ColorDefinition;
    foreground: ColorDefinition;
    border?: ColorDefinition;
}

export interface InputValidationState extends ComponentState {
    message: ColorDefinition;
}

export interface InputVariant extends InteractiveState {
    readonly: ComponentState;
    error: InputValidationState;
    success: InputValidationState;
    prefix: InputAddonState;
    suffix: InputAddonState;
    placeholder: ColorDefinition;
    label: ColorDefinition;
}

// Select Specific States
export interface SelectVariant extends InputVariant {
    options: {
        background: ColorDefinition;
        hover: ColorDefinition;
        selected: ColorDefinition;
    };
    dropdown: {
        background: ColorDefinition;
        border: ColorDefinition;
        shadow: ColorDefinition;
    };
}

// Checkbox and Radio Variants
export interface ToggleVariant extends InteractiveState {
    checked: {
        default: ComponentState;
        hover: ComponentState;
        disabled: ComponentState;
    };
    indeterminate?: {
        default: ComponentState;
        hover: ComponentState;
        disabled: ComponentState;
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
}

// Toast/Notification Variants
export interface ToastVariant extends ComponentState {
    success: ComponentState;
    error: ComponentState;
    warning: ComponentState;
    info: ComponentState;
}

// Tab Variant
export interface TabVariant extends InteractiveState {
    selected: ComponentState;
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
}

// Tooltip Variant
export interface TooltipVariant {
    background: ColorDefinition;
    foreground: ColorDefinition;
    arrow: ColorDefinition;
}

// Component Collection Interface
export interface ComponentVariants {
    button: {
        primary: ButtonVariant;
        secondary: ButtonVariant;
        tertiary: ButtonVariant;
        danger: ButtonVariant;
    };
    input?: InputVariant;
    select?: SelectVariant;
    checkbox?: ToggleVariant;
    radio?: ToggleVariant;
    card?: CardVariant;
    modal?: ModalVariant;
    toast?: ToastVariant;
    tab?: TabVariant;
    menu?: MenuVariant;
    badge?: BadgeVariant;
    progress?: ProgressVariant;
    tooltip?: TooltipVariant;
}

