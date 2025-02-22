import { InputBaseColorSet, ButtonBaseColorSet } from '../../../core/colors';

export interface FormElementMappings {
    input: InputBaseColorSet;
    select: InputBaseColorSet;
    checkbox: InputBaseColorSet;
    radio: InputBaseColorSet;
    switch: InputBaseColorSet;
    textarea: InputBaseColorSet;
    button: Record<'primary' | 'secondary' | 'ghost' | 'link' | 'danger', ButtonBaseColorSet>;
}
