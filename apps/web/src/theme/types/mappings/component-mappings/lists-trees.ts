// /theme/types/mapping/component-mappings/list-trees.ts

import { ComponentColorSet } from "../../components";

export interface ListTreeMappings {
    list: ComponentColorSet & {
        item: {
            hover: string;
            active: string;
            selected: string;
        };
        divider: string;
    };
    tree: ComponentColorSet & {
        item: {
            hover: string;
            active: string;
            selected: string;
        };
        expandIcon: string;
    };
}
