// theme/types/mappings/typography-mappings.ts

/**
 * Typography Mappings
 * Defines font families, sizes, and styles for the theme.
 *
 * @example
 * const typographySettings: TypographyMappings = {
 *   fonts: {
 *     primary: { family: 'Inter', weight: { light: 300, regular: 400, bold: 700 }, size: '16px', lineHeight: '1.5', letterSpacing: '0.01em' },
 *     secondary: { family: 'Arial', weight: { light: 300, regular: 400, bold: 700 }, size: '14px', lineHeight: '1.4', letterSpacing: '0.02em' },
 *     mono: { family: 'Courier New', weight: { regular: 400, bold: 700 }, size: '14px', lineHeight: '1.5', letterSpacing: '0' }
 *   },
 *   headings: {
 *     h1: { fontSize: '32px', fontWeight: 700, lineHeight: '1.2', letterSpacing: '0' },
 *     h2: { fontSize: '28px', fontWeight: 600, lineHeight: '1.3', letterSpacing: '0' }
 *   }
 * };
 */

export interface FontSettings {
    family: string;
    weight: {
        light: number;
        regular: number;
        medium: number;
        semibold: number;
        bold: number;
    };
    size: string;
    lineHeight: string | number;
    letterSpacing: string;
}

export interface TextStyles {
    color: string;
    fontSize: string;
    fontWeight: number;
    lineHeight: string | number;
    letterSpacing: string;
}

export interface TypographyMappings {
    fonts: {
        primary: FontSettings;
        secondary: FontSettings;
        mono: FontSettings;
    };

    headings: {
        h1: TextStyles;
        h2: TextStyles;
        h3: TextStyles;
        h4: TextStyles;
        h5: TextStyles;
        h6: TextStyles;
    };

    body: {
        large: TextStyles;
        base: TextStyles;
        small: TextStyles;
        tiny: TextStyles;
    };

    display: {
        "2xl": TextStyles;
        xl: TextStyles;
        lg: TextStyles;
        md: TextStyles;
    };

    utils: {
        truncate: {
            maxLines: number;
            lineClamp: string;
            overflow: string;
        };
        wordBreak: {
            normal: string;
            break: string;
            keep: string;
        };
    };

    // Additional typography settings
    paragraphSpacing: {
        tight: string;
        normal: string;
        loose: string;
    };

    lists: {
        indent: string;
        itemSpacing: string;
        markerColor: string;
    };

    code: {
        inline: TextStyles;
        block: TextStyles;
    };
}
