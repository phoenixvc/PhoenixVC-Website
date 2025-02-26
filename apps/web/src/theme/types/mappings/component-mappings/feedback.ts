// /theme/types/mapping/component-mappings/feedback.ts

import { ComponentColorSet } from "../../components";
import { SemanticColors } from "../../core";

export interface FeedbackMappings {
    alert: Record<keyof SemanticColors, ComponentColorSet>;
    toast: Record<keyof SemanticColors, ComponentColorSet>;
    notification: Record<keyof SemanticColors, ComponentColorSet>;
}
