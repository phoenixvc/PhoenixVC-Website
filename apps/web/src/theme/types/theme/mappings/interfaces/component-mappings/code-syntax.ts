import { ComponentColorSet } from '../../../core/colors';

export interface CodeSyntaxMappings {
    code: ComponentColorSet & {
        syntax: {
            comment: string;
            string: string;
            keyword: string;
            variable: string;
            function: string;
            operator: string;
            class: string;
            number: string;
            constant: string;
            regex: string;
            markup: string;
        };
        lineNumber: string;
        selection: string;
        highlight: string;
    };
}
