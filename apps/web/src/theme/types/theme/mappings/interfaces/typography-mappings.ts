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
        '2xl': TextStyles;
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
