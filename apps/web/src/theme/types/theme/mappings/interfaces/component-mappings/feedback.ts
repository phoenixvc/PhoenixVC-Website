import { ComponentColorSet, SemanticColors } from '../../../core/colors';

export interface FeedbackMappings {
    alert: Record<keyof SemanticColors, ComponentColorSet>;
    toast: Record<keyof SemanticColors, ComponentColorSet>;
    notification: Record<keyof SemanticColors, ComponentColorSet>;
}
