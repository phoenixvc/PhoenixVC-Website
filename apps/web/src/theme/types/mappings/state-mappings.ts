import { ComponentColorSet } from "../components";
import { ColorDefinition } from "../core/colors";

// core/colors.ts
export interface ComponentState {
    background: Partial<ColorDefinition>;
    foreground: Partial<ColorDefinition>;
    border: Partial<ColorDefinition>;
    shadow?: Partial<ColorDefinition>;
    opacity?: Partial<ColorDefinition>;
    style?: Record<string, string | number>;
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

// navigation-components.ts
export interface NavigationItem extends InteractiveState {
    selected: Partial<ComponentState>;
    current: Partial<ComponentState>;
    parent: Partial<ComponentState>;
    child: Partial<ComponentState>;
    icon: Partial<ComponentState>;
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
