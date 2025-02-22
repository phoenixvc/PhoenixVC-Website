import { ComponentColorSet } from '../../../core/colors';

export interface MediaMappings {
    video: ComponentColorSet & {
        controls: ComponentColorSet;
        progress: string;
        buffer: string;
    };
    skeleton: {
        base: string;
        highlight: string;
        animation: string;
    };
    upload: ComponentColorSet & {
        dragActive: string;
        dragReject: string;
        progressBar: string;
    };
}
