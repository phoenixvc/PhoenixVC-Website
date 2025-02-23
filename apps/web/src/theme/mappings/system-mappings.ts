export interface SystemMappings {
    breakpoints: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        '2xl': string;
    };
    zIndices: {
        hide: number;
        auto: number;
        base: number;
        dropdown: number;
        sticky: number;
        fixed: number;
        modal: number;
        popover: number;
        toast: number;
        tooltip: number;
    };
    radii: {
        none: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        full: string;
    };
    transitions: {
        duration: Record<string, string>;
        timing: Record<string, string>;
    };
    animation: {
        keyframes: Record<string, string>;
        duration: Record<string, string>;
        easing: Record<string, string>;
    };
}
