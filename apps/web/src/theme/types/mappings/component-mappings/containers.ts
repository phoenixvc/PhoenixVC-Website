// /theme/types/mapping/component-mappings/containers.ts

import { ComponentColorSet } from "../../components";

export interface ContainerMappings {
    card: ComponentColorSet;
    modal: ComponentColorSet & {
        overlay: string;
        backdrop: string;
    };
    drawer: ComponentColorSet & {
        overlay: string;
    };
    popover: ComponentColorSet;
    tooltip: ComponentColorSet;
    accordion: ComponentColorSet;
    collapse: ComponentColorSet;
}
