// /theme/types/mapping/component-mappings/data-display.ts

import { ComponentColorSet, TableColorSet } from "../../components";
import { SemanticColors } from "../../core";


export interface DataDisplayMappings {
    table: TableColorSet;
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
