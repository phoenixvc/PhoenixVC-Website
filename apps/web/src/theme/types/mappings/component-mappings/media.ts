// /theme/types/mapping/component-mappings/media.ts

import { ComponentColorSet } from "../../components";

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
