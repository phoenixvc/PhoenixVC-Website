// src/types/theme/components.ts

import {
    ComponentColorSet,
    ColorSet,
    SemanticColors,
    TextColorSet,
    InputBaseColorSet,
    ButtonBaseColorSet,
    NavigationBaseColorSet,
    TableBaseColorSet,
    ChartBaseColorSet
} from '../core/colors';

/**
 * Base interactive component states
 * @description Extended states for interactive components
 */
export interface InteractiveStates extends Omit<ComponentColorSet, 'focus'> {
    focus: {
        ring: string;
        outline: string;
        shadow: string;
    };
    loading: {
        background: string;
        spinner: string;
        text: string;
    };
}

/**
 * Form input color set
 * @description Colors for form input components
 */
export interface InputComponentColorSet extends InputBaseColorSet {
    states: InteractiveStates;
    label: {
        text: string;
        required: string;
        optional: string;
    };

    helper: {
        text: string;
        error: string;
        success: string;
    };

    icon: {
        default: string;
        focus: string;
        error: string;
        success: string;
    };

    variants: {
        outlined: ColorSet & { states: InteractiveStates };
        filled: ColorSet & { states: InteractiveStates };
        underlined: ColorSet & { states: InteractiveStates };
    };
}

/**
 * Button color set
 * @description Colors for button components
 */
export interface ButtonComponentColorSet extends ButtonBaseColorSet {
    states: InteractiveStates;

    variants: {
        solid: ColorSet & { states: InteractiveStates };
        outline: ColorSet & { states: InteractiveStates };
        ghost: ColorSet & { states: InteractiveStates };
        link: ColorSet & { states: InteractiveStates };
        text: ColorSet & { states: InteractiveStates };
    };

    sizes: {
        sm: ColorSet;
        md: ColorSet;
        lg: ColorSet;
        xl: ColorSet;
    };

    icon: {
        left: ColorSet;
        right: ColorSet;
        only: ColorSet;
    };

    group: {
        divider: string;
        connector: string;
    };
}

/**
 * Navigation color set
 * @description Colors for navigation components
 */
export interface NavigationComponentColorSet extends NavigationBaseColorSet {
    states: {
        active: ColorSet;
        hover: ColorSet;
        inactive: ColorSet;
        disabled: ColorSet;
    };

    indicator: {
        active: string;
        hover: string;
        position: 'left' | 'right' | 'top' | 'bottom';
        transition: string;
    };

    icon: {
        default: string;
        active: string;
        hover: string;
        disabled: string;
        size: {
            sm: string;
            md: string;
            lg: string;
        };
    };

    badge: {
        background: string;
        text: string;
        border: string;
        variants: {
            primary: ColorSet;
            secondary: ColorSet;
            error: ColorSet;
            warning: ColorSet;
            success: ColorSet;
        };
    };

    dropdown: {
        background: string;
        itemHover: string;
        itemActive: string;
        divider: string;
        shadow: string;
        animation: {
            duration: string;
            timing: string;
        };
    };

    mobile: {
        background: string;
        overlay: string;
        hamburger: string;
        transition: {
            duration: string;
            timing: string;
        };
        drawer: {
            background: string;
            width: string;
            shadow: string;
        };
    };

    breadcrumb: {
        separator: string;
        active: string;
        inactive: string;
    };
}

/**
 * Table component color set
 * @description Extended colors for table components with additional styling options
 */
export interface TableComponentColorSet extends TableBaseColorSet {
    header: TableBaseColorSet['header'] & {
        states: InteractiveStates;
        sortIcon: ColorSet;
        filterIcon: ColorSet;
    };

    row: TableBaseColorSet['row'] & {
        states: InteractiveStates;
        alternate: ColorSet;
        expanded: ColorSet;
    };

    cell: TableBaseColorSet['cell'] & {
        padding: string;
        alignment: 'left' | 'center' | 'right';
    };

    // Additional component-specific properties
    pagination: {
        active: ColorSet & { states: InteractiveStates };
        inactive: ColorSet & { states: InteractiveStates };
        arrows: ColorSet;
    };

    selection: {
        checkbox: ColorSet & { states: InteractiveStates };
        highlight: string;
    };

    loading: {
        overlay: string;
        spinner: string;
    };

    empty: {
        background: string;
        text: string;
        icon: string;
    };
}

/**
 * Chart component color set
 * @description Extended colors for chart components with additional styling options
 */
export interface ChartComponentColorSet extends ChartBaseColorSet {
    // Color palettes (extends base series)
    series: string[];    // inherits from base
    primary: string[];   // additional color sets
    secondary: string[];
    accent: string[];

    // Extends base grid
    grid: ChartBaseColorSet['grid'] & {
        line: string;
        tick: string;
        background: string;
    };

    // Extends base axis
    axis: ChartBaseColorSet['axis'] & {
        line: string;
        text: string;
        title: string;
    };

    // Additional component-specific properties
    labels: {
        primary: string;
        secondary: string;
        value: string;
    };

    // Extends base tooltip
    tooltip: ChartBaseColorSet['tooltip'] & {
        states: InteractiveStates;
        arrow: string;
        shadow: string;
    };

    legend: ColorSet & {
        states: InteractiveStates;
        item: {
            hover: string;
            active: string;
            inactive: string;
        };
        marker: {
            border: string;
            size: string;
        };
    };

    patterns: {
        dots: string;
        lines: string;
        crosshatch: string;
    };

    animation: {
        duration: string;
        easing: string;
    };
}

/**
 * Modal color set
 * @description Colors for modal/dialog components
 */
export interface ModalColorSet extends ColorSet {
    states: InteractiveStates;

    overlay: {
        background: string;
        opacity: number;
    };

    content: {
        background: string;
        border: string;
        shadow: string;
    };

    header: ColorSet;
    body: ColorSet;
    footer: ColorSet;

    closeButton: ColorSet & { states: InteractiveStates };

    animation: {
        duration: string;
        timing: string;
    };
}

/**
 * Card color set
 * @description Colors for card components
 */
export interface CardColorSet extends ColorSet {
    states: InteractiveStates;

    header: ColorSet;
    body: ColorSet;
    footer: ColorSet;

    media: {
        overlay: string;
        placeholder: string;
    };

    variants: {
        elevated: ColorSet & { states: InteractiveStates };
        outlined: ColorSet & { states: InteractiveStates };
        filled: ColorSet & { states: InteractiveStates };
    };
}

/**
 * Form color set
 * @description Colors for form components
 */
export interface FormColorSet {
    fieldset: {
        border: string;
        legend: string;
        background: string;
    };

    label: TextColorSet;

    validation: {
        error: SemanticColors['error'];
        success: SemanticColors['success'];
        warning: SemanticColors['warning'];
    };

    helper: {
        text: string;
        icon: string;
    };
}
