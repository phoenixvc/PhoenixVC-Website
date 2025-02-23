import { FormElementMappings } from './form-elements.js';
import { NavigationMappings } from './navigation.js';
import { ContainerMappings } from './containers.js';
import { FeedbackMappings } from './feedback.js';
import { DataDisplayMappings } from './data-display.js';
import { ListTreeMappings } from './lists-trees.js';
import { CodeSyntaxMappings } from './code-syntax.js';
import { VisualizationMappings } from './visualization.js';
import { MediaMappings } from './media.js';

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

export * from './form-elements.js';
export * from './navigation.js';
export * from './containers.js';
export * from './feedback.js';
export * from './data-display.js';
export * from './lists-trees.js';
export * from './code-syntax.js';
export * from './visualization.js';
export * from './media.js';
