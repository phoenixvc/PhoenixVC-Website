// /theme/types/mapping/component-mappings/navigation.ts

import { ChartColorSet } from "../../components";

export interface VisualizationMappings {
    chart: ChartColorSet;
    datavis: {
        categorical: string[];
        sequential: string[];
        diverging: string[];
        qualitative: string[];
    };
}
