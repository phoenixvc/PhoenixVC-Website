import { ComponentColorSet, SemanticColors, TableBaseColorSet } from '../../../core/colors';

export interface DataDisplayMappings {
    table: TableBaseColorSet;
    badge: Record<keyof SemanticColors, ComponentColorSet>;
    tag: Record<keyof SemanticColors, ComponentColorSet>;
    avatar: ComponentColorSet & {
        ring: string;
        placeholder: string;
    };
    progress: {
        track: string;
        indicator: Record<keyof SemanticColors, string>;
        text: string;
    };
    spinner: Record<keyof SemanticColors, string>;
}
