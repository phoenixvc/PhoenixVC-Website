import { ComponentColorSet } from '../../../core/colors';

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
