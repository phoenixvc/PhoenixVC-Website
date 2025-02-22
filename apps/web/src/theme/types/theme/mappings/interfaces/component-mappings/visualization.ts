import { ChartBaseColorSet } from '../../../core/colors';

export interface VisualizationMappings {
    chart: ChartBaseColorSet;
    datavis: {
        categorical: string[];
        sequential: string[];
        diverging: string[];
        qualitative: string[];
    };
}
