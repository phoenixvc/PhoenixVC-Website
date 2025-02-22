import { ScaleValue } from './base';

export interface FontMetrics {
    ascent: number;
    descent: number;
    lineGap: number;
    unitsPerEm: number;
    capHeight: number;
    xHeight: number;
}

export interface TypographyScale {
    fontSize: string;
    lineHeight: string | number;
    letterSpacing: string;
    fontWeight: number;
    fontFamily?: string;
}

export interface TypographyPreset {
    h1: TypographyScale;
    h2: TypographyScale;
    h3: TypographyScale;
    h4: TypographyScale;
    h5: TypographyScale;
    h6: TypographyScale;
    body1: TypographyScale;
    body2: TypographyScale;
    subtitle1: TypographyScale;
    subtitle2: TypographyScale;
    caption: TypographyScale;
    overline: TypographyScale;
    button: TypographyScale;
    code: TypographyScale;
}

export interface TypographyMappingOptions {
    baseSize: number;
    baseLineHeight: number;
    scaleRatio: number;
    fontFamilies: {
        base: string;
        heading: string;
        mono: string;
        [key: string]: string;
    };
}

export class TypographyMapping {
    private scales: Map<string, TypographyScale>;
    private presets: Map<string, TypographyPreset>;
    private options: TypographyMappingOptions;

    constructor(options: TypographyMappingOptions) {
        this.scales = new Map();
        this.presets = new Map();
        this.options = options;
    }

    calculateScale(level: ScaleValue): TypographyScale {
        const size = this.options.baseSize * Math.pow(this.options.scaleRatio, level - 1);
        const lineHeight = Math.round(size * this.options.baseLineHeight);

        return {
            fontSize: `${size}px`,
            lineHeight: `${lineHeight}px`,
            letterSpacing: 'normal',
            fontWeight: 400
        };
    }

    setScale(name: string, scale: TypographyScale): void {
        this.scales.set(name, scale);
    }

    getScale(name: string): TypographyScale | undefined {
        return this.scales.get(name);
    }

    generatePreset(name: string = 'default'): TypographyPreset {
        return {
            h1: this.calculateScale(6),
            h2: this.calculateScale(5),
            h3: this.calculateScale(4),
            h4: this.calculateScale(3),
            h5: this.calculateScale(2),
            h6: this.calculateScale(1),
            body1: this.calculateScale(2),
            body2: this.calculateScale(1),
            subtitle1: this.calculateScale(2),
            subtitle2: this.calculateScale(1),
            caption: {
                ...this.calculateScale(1),
                fontWeight: 400
            },
            overline: {
                ...this.calculateScale(1),
                textTransform: 'uppercase' as const,
                letterSpacing: '0.1em'
            },
            button: {
                ...this.calculateScale(2),
                fontWeight: 500
            },
            code: {
                ...this.calculateScale(1),
                fontFamily: this.options.fontFamilies.mono
            }
        };
    }

    toCSS(prefix: string = '--typography'): Record<string, string> {
        const css: Record<string, string> = {};

        this.scales.forEach((scale, name) => {
            Object.entries(scale).forEach(([prop, value]) => {
                css[`${prefix}-${name}-${prop}`] = value.toString();
            });
        });

        return css;
    }

    fromCSS(variables: Record<string, string>, prefix: string = '--typography'): void {
        const scaleMap = new Map<string, Partial<TypographyScale>>();

        Object.entries(variables).forEach(([key, value]) => {
            if (key.startsWith(prefix)) {
                const [, name, prop] = key.split('-');
                const scale = scaleMap.get(name) || {};
                scale[prop as keyof TypographyScale] = value;
                scaleMap.set(name, scale);
            }
        });

        scaleMap.forEach((scale, name) => {
            if (this.isCompleteScale(scale)) {
                this.setScale(name, scale as TypographyScale);
            }
        });
    }

    private isCompleteScale(scale: Partial<TypographyScale>): boolean {
        const required: (keyof TypographyScale)[] = ['fontSize', 'lineHeight', 'letterSpacing', 'fontWeight'];
        return required.every(prop => prop in scale);
    }
}
