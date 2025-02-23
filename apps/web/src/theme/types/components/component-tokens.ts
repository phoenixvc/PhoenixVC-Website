
  import { ColorDefinition, ColorSet, SemanticColors } from '../core/colors';
  import { ButtonColorSet, ChartColorSet, ComponentColorSet, InputColorSet, InteractiveStates, NavigationColorSet, TableColorSet, TextColorSet } from './base-colors';

  /**
   * Base interactive component states for higher–level components.
   */
  export interface ExtendedInteractiveStates extends InteractiveStates {
    // Additional interactive state definitions can be added here if needed.
  }

  /**
   * Input Component Color Set
   * Extends the base input colors with interactive states and component-specific variants.
   */
  export interface InputComponentColorSet extends InputColorSet {
    states: ExtendedInteractiveStates;
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
      outlined: ColorSet & { states: ExtendedInteractiveStates };
      filled: ColorSet & { states: ExtendedInteractiveStates };
      underlined: ColorSet & { states: ExtendedInteractiveStates };
    };
  }

  /**
   * Button Component Color Set
   * Extends the base button colors with interactive states, size variations, and icon groups.
   */
  export interface ButtonComponentColorSet extends ButtonColorSet {
    states: ExtendedInteractiveStates;
    variants: {
      solid: ColorSet & { states: ExtendedInteractiveStates };
      outline: ColorSet & { states: ExtendedInteractiveStates };
      ghost: ColorSet & { states: ExtendedInteractiveStates };
      link: ColorSet & { states: ExtendedInteractiveStates };
      text: ColorSet & { states: ExtendedInteractiveStates };
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
   * Navigation Component Color Set
   * Defines colors for navigation elements including states, indicators, and mobile configurations.
   */
  export interface NavigationComponentColorSet extends NavigationColorSet {
    states: {
      active: ColorSet;
      hover: ColorSet;
      inactive: ColorSet;
      disabled: ColorSet;
    };
    indicator: ComponentColorSet & {
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
   * Table Component Color Set
   * Extends base table colors with header, row, cell, pagination, selection, loading, and empty states.
   */
  export interface TableComponentColorSet extends TableColorSet {
    header: TableColorSet['header'] & {
      states: ExtendedInteractiveStates;
      sortIcon: ColorSet;
      filterIcon: ColorSet;
    };
    row: TableColorSet['row'] & {
      states: ExtendedInteractiveStates;
      alternate: ColorSet;
      expanded: ColorSet;
    };
    cell: TableColorSet['cell'] & {
      padding: string;
      alignment: 'left' | 'center' | 'right';
    };
    pagination: {
      active: ColorSet & { states: ExtendedInteractiveStates };
      inactive: ColorSet & { states: ExtendedInteractiveStates };
      arrows: ColorSet;
    };
    selection: {
      checkbox: ColorSet & { states: ExtendedInteractiveStates };
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
   * Chart Component Color Set
   * Defines extended color sets for chart components.
   */
  export interface ChartComponentColorSet extends ChartColorSet {
    series: ColorDefinition[];    // Inherits base series as ColorDefinition[]
    primary: ColorDefinition[];   // Additional palette options
    secondary: ColorDefinition[];
    accent: ColorDefinition[];
    grid: ChartColorSet['grid'] & {
      line: string;
      tick: string;
      background: string;
    };
    axis: ChartColorSet['axis'] & {
      line: string;
      text: string;
      title: string;
    };
    labels: {
      primary: string;
      secondary: string;
      value: string;
    };
    tooltip: ChartColorSet['tooltip'] & {
      states: ExtendedInteractiveStates;
      arrow: string;
      shadow: string;
    };
    legend: ColorSet & {
      states: ExtendedInteractiveStates;
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
   * Modal Component Color Set
   * Defines colors for modal or dialog components.
   */
  export interface ModalComponentColorSet extends ColorSet {
    states: ExtendedInteractiveStates;
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
    closeButton: ColorSet & { states: ExtendedInteractiveStates };
    animation: {
      duration: string;
      timing: string;
    };
  }

  /**
   * Card Component Color Set
   * Defines colors for card components.
   */
  export interface CardColorSet extends ColorSet {
    states: ExtendedInteractiveStates;
    header: ColorSet;
    body: ColorSet;
    footer: ColorSet;
    media: {
      overlay: string;
      placeholder: string;
    };
    variants: {
      elevated: ColorSet & { states: ExtendedInteractiveStates };
      outlined: ColorSet & { states: ExtendedInteractiveStates };
      filled: ColorSet & { states: ExtendedInteractiveStates };
    };
  }

  /**
   * Form Component Color Set
   * Defines colors for form components.
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
