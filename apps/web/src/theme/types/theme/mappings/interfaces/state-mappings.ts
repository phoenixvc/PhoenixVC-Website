// core/colors.ts
export interface ColorDefinition {
    hex: string;
    rgb: string;
    hsl: string;
    alpha?: number;
}

export interface ComponentColorSet {
    background: ColorDefinition;
    foreground: ColorDefinition;
    border: ColorDefinition;
}

// base-states.ts
export interface ComponentState {
    background: ColorDefinition;
    foreground: ColorDefinition;
    border: ColorDefinition;
    shadow?: ColorDefinition;
    opacity?: ColorDefinition;
}

export interface InteractiveState extends ComponentState {
    hover: Partial<ComponentState>;
    active: Partial<ComponentState>;
    focus: Partial<ComponentState>;
    disabled: Partial<ComponentState>;
}

// state-mappings.ts
export interface StateMappings {
    disabled: ComponentColorSet;
    loading: ComponentColorSet;
    readonly: ComponentColorSet;
    error: ComponentColorSet;
    success: ComponentColorSet;
    warning: ComponentColorSet;
    info: ComponentColorSet;
}

// form-components.ts
export interface FormComponentState extends InteractiveState {
    placeholder: string;
    label: string;
    error: Partial<ComponentState>;
    success: Partial<ComponentState>;
    readonly: Partial<ComponentState>;
}

export interface InputVariant extends FormComponentState {
    prefix: Partial<ComponentState>;
    suffix: Partial<ComponentState>;
    clearButton: Partial<InteractiveState>;
}

// navigation-components.ts
export interface NavigationItem extends InteractiveState {
    selected: Partial<ComponentState>;
    current: Partial<ComponentState>;
    parent: Partial<ComponentState>;
    child: Partial<ComponentState>;
    icon: Partial<ComponentState>;
}

// button-components.ts
export interface ButtonVariant extends InteractiveState {
    startIcon?: string;
    endIcon?: string;
    loadingSpinner?: string;
}

// table-components.ts
export interface TableVariant extends ComponentState {
    header: ComponentState;
    row: InteractiveState;
    cell: ComponentState;
    footer: ComponentState;
    sortIcon: ComponentState;
    pagination: InteractiveState;
}
