import { FormElementMappings } from './form-elements';
import { NavigationMappings } from './navigation';
import { ContainerMappings } from './containers';
import { FeedbackMappings } from './feedback';
import { DataDisplayMappings } from './data-display';
import { ListTreeMappings } from './lists-trees';
import { CodeSyntaxMappings } from './code-syntax';
import { VisualizationMappings } from './visualization';
import { MediaMappings } from './media';

export interface ComponentMappings extends
    FormElementMappings,
    NavigationMappings,
    ContainerMappings,
    FeedbackMappings,
    DataDisplayMappings,
    ListTreeMappings,
    CodeSyntaxMappings,
    VisualizationMappings,
    MediaMappings {}

export * from './form-elements';
export * from './navigation';
export * from './containers';
export * from './feedback';
export * from './data-display';
export * from './lists-trees';
export * from './code-syntax';
export * from './visualization';
export * from './media';
