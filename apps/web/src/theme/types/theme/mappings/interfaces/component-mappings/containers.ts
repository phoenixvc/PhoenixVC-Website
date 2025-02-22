import { ComponentColorSet } from '../../../core/colors';

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
