// Add to colors.ts
export interface ColorUtilities {
    darken: (color: ColorDefinition, amount: number) => ColorDefinition;
    lighten: (color: ColorDefinition, amount: number) => ColorDefinition;
    getContrastRatio: (background: ColorDefinition, foreground: ColorDefinition) => number;
}

export interface ColorSchemeGenerator {
    fromBase: (baseColor: ColorDefinition) => ColorShades;
    generatePalette: (config: ColorPaletteConfig) => BaseColors;
}
