import { ColorDefinition, ThemeColors } from "@/theme/types";


// Helper function to create a basic ColorDefinition
const createColor = (hex: string, rgb: string, hsl: string, alpha = 1): ColorDefinition => ({
  hex,
  rgb,
  hsl,
  alpha,
});

export const OceanTheme: ThemeColors = {
  schemes: {
    default: {
      base: {
        primary: {
          50: createColor("#E3F2FD", "rgb(227, 242, 253)", "hsl(206, 93%, 94%)"),
          100: createColor("#BBDEFB", "rgb(187, 222, 251)", "hsl(207, 89%, 86%)"),
          200: createColor("#90CAF9", "rgb(144, 202, 249)", "hsl(207, 89%, 77%)"),
          300: createColor("#64B5F6", "rgb(100, 181, 246)", "hsl(207, 89%, 68%)"),
          400: createColor("#42A5F5", "rgb(66, 165, 245)", "hsl(207, 90%, 61%)"),
          500: createColor("#2196F3", "rgb(33, 150, 243)", "hsl(207, 90%, 54%)"),
          600: createColor("#1E88E5", "rgb(30, 136, 229)", "hsl(208, 82%, 51%)"),
          700: createColor("#1976D2", "rgb(25, 118, 210)", "hsl(208, 79%, 46%)"),
          800: createColor("#1565C0", "rgb(21, 101, 192)", "hsl(208, 80%, 42%)"),
          900: createColor("#0D47A1", "rgb(13, 71, 161)", "hsl(208, 85%, 34%)"),
        },
        secondary: {
          50: createColor("#E0F7FA", "rgb(224, 247, 250)", "hsl(187, 71%, 93%)"),
          100: createColor("#B2EBF2", "rgb(178, 235, 242)", "hsl(187, 71%, 82%)"),
          200: createColor("#80DEEA", "rgb(128, 222, 234)", "hsl(187, 71%, 71%)"),
          300: createColor("#4DD0E1", "rgb(77, 208, 225)", "hsl(187, 71%, 59%)"),
          400: createColor("#26C6DA", "rgb(38, 198, 218)", "hsl(187, 71%, 50%)"),
          500: createColor("#00BCD4", "rgb(0, 188, 212)", "hsl(187, 100%, 42%)"),
          600: createColor("#00ACC1", "rgb(0, 172, 193)", "hsl(187, 100%, 38%)"),
          700: createColor("#0097A7", "rgb(0, 151, 167)", "hsl(187, 100%, 33%)"),
          800: createColor("#00838F", "rgb(0, 131, 143)", "hsl(187, 100%, 28%)"),
          900: createColor("#006064", "rgb(0, 96, 100)", "hsl(187, 100%, 20%)"),
        },
        accent: {
          50: createColor("#E1F5FE", "rgb(225, 245, 254)", "hsl(199, 92%, 94%)"),
          100: createColor("#B3E5FC", "rgb(179, 229, 252)", "hsl(199, 92%, 85%)"),
          200: createColor("#81D4FA", "rgb(129, 212, 250)", "hsl(199, 92%, 74%)"),
          300: createColor("#4FC3F7", "rgb(79, 195, 247)", "hsl(199, 92%, 64%)"),
          400: createColor("#29B6F6", "rgb(41, 182, 246)", "hsl(199, 92%, 56%)"),
          500: createColor("#03A9F4", "rgb(3, 169, 244)", "hsl(199, 98%, 48%)"),
          600: createColor("#039BE5", "rgb(3, 155, 229)", "hsl(199, 98%, 45%)"),
          700: createColor("#0288D1", "rgb(2, 136, 209)", "hsl(199, 98%, 41%)"),
          800: createColor("#0277BD", "rgb(2, 119, 189)", "hsl(199, 98%, 37%)"),
          900: createColor("#01579B", "rgb(1, 87, 155)", "hsl(199, 98%, 31%)"),
        },
      },
      light: {
        background: createColor("#FFFFFF", "rgb(255, 255, 255)", "hsl(0, 0%, 100%)"),
        text: createColor("#1A1A1A", "rgb(26, 26, 26)", "hsl(0, 0%, 10%)"),
        muted: createColor("#757575", "rgb(117, 117, 117)", "hsl(0, 0%, 46%)"),
        border: createColor("#E0E0E0", "rgb(224, 224, 224)", "hsl(0, 0%, 88%)"),
        surface: createColor("#F5F5F5", "rgb(245, 245, 245)", "hsl(0, 0%, 96%)"),
      },
      dark: {
        background: createColor("#0A1929", "rgb(10, 25, 41)", "hsl(210, 61%, 10%)"),
        text: createColor("#FFFFFF", "rgb(255, 255, 255)", "hsl(0, 0%, 100%)"),
        muted: createColor("#B0BEC5", "rgb(176, 190, 197)", "hsl(200, 15%, 73%)"),
        border: createColor("#1E2A35", "rgb(30, 42, 53)", "hsl(209, 28%, 16%)"),
        surface: createColor("#132F4C", "rgb(19, 47, 76)", "hsl(210, 60%, 19%)"),
      },
    },
  },
  semantic: {
    success: createColor("#2E7D32", "rgb(46, 125, 50)", "hsl(123, 46%, 34%)"),
    warning: createColor("#ED6C02", "rgb(237, 108, 2)", "hsl(27, 98%, 47%)"),
    error: createColor("#D32F2F", "rgb(211, 47, 47)", "hsl(0, 65%, 51%)"),
    info: createColor("#0288D1", "rgb(2, 136, 209)", "hsl(199, 98%, 41%)"),
  },
};

export const ForestTheme: ThemeColors = {
  schemes: {
    default: {
      base: {
        primary: {
          50: createColor("#E8F5E9", "rgb(232, 245, 233)", "hsl(122, 39%, 93%)"),
          100: createColor("#C8E6C9", "rgb(200, 230, 201)", "hsl(122, 38%, 84%)"),
          200: createColor("#A5D6A7", "rgb(165, 214, 167)", "hsl(122, 37%, 74%)"),
          300: createColor("#81C784", "rgb(129, 199, 132)", "hsl(122, 37%, 64%)"),
          400: createColor("#66BB6A", "rgb(102, 187, 106)", "hsl(122, 39%, 57%)"),
          500: createColor("#4CAF50", "rgb(76, 175, 80)", "hsl(122, 39%, 49%)"),
          600: createColor("#43A047", "rgb(67, 160, 71)", "hsl(123, 41%, 45%)"),
          700: createColor("#388E3C", "rgb(56, 142, 60)", "hsl(123, 43%, 39%)"),
          800: createColor("#2E7D32", "rgb(46, 125, 50)", "hsl(123, 46%, 34%)"),
          900: createColor("#1B5E20", "rgb(27, 94, 32)", "hsl(124, 55%, 24%)"),
        },
        secondary: {
          50: createColor("#F1F8E9", "rgb(241, 248, 233)", "hsl(88, 50%, 94%)"),
          100: createColor("#DCEDC8", "rgb(220, 237, 200)", "hsl(88, 50%, 86%)"),
          200: createColor("#C5E1A5", "rgb(197, 225, 165)", "hsl(88, 50%, 76%)"),
          300: createColor("#AED581", "rgb(174, 213, 129)", "hsl(88, 50%, 67%)"),
          400: createColor("#9CCC65", "rgb(156, 204, 101)", "hsl(88, 50%, 60%)"),
          500: createColor("#8BC34A", "rgb(139, 195, 74)", "hsl(88, 50%, 53%)"),
          600: createColor("#7CB342", "rgb(124, 179, 66)", "hsl(88, 46%, 48%)"),
          700: createColor("#689F38", "rgb(104, 159, 56)", "hsl(88, 48%, 42%)"),
          800: createColor("#558B2F", "rgb(85, 139, 47)", "hsl(88, 50%, 36%)"),
          900: createColor("#33691E", "rgb(51, 105, 30)", "hsl(88, 56%, 26%)"),
        },
        accent: {
          50: createColor("#FFF8E1", "rgb(255, 248, 225)", "hsl(48, 100%, 94%)"),
          100: createColor("#FFECB3", "rgb(255, 236, 179)", "hsl(48, 100%, 85%)"),
          200: createColor("#FFE082", "rgb(255, 224, 130)", "hsl(48, 100%, 75%)"),
          300: createColor("#FFD54F", "rgb(255, 213, 79)", "hsl(48, 100%, 65%)"),
          400: createColor("#FFCA28", "rgb(255, 202, 40)", "hsl(48, 100%, 58%)"),
          500: createColor("#FFC107", "rgb(255, 193, 7)", "hsl(48, 100%, 51%)"),
          600: createColor("#FFB300", "rgb(255, 179, 0)", "hsl(48, 100%, 50%)"),
          700: createColor("#FFA000", "rgb(255, 160, 0)", "hsl(48, 100%, 50%)"),
          800: createColor("#FF8F00", "rgb(255, 143, 0)", "hsl(48, 100%, 50%)"),
          900: createColor("#FF6F00", "rgb(255, 111, 0)", "hsl(48, 100%, 50%)"),
        },
      },
      light: {
        background: createColor("#FAFAFA", "rgb(250, 250, 250)", "hsl(0, 0%, 98%)"),
        text: createColor("#1A1A1A", "rgb(26, 26, 26)", "hsl(0, 0%, 10%)"),
        muted: createColor("#757575", "rgb(117, 117, 117)", "hsl(0, 0%, 46%)"),
        border: createColor("#E0E0E0", "rgb(224, 224, 224)", "hsl(0, 0%, 88%)"),
        surface: createColor("#FFFFFF", "rgb(255, 255, 255)", "hsl(0, 0%, 100%)"),
      },
      dark: {
        background: createColor("#1B2A1B", "rgb(27, 42, 27)", "hsl(120, 22%, 14%)"),
        text: createColor("#FFFFFF", "rgb(255, 255, 255)", "hsl(0, 0%, 100%)"),
        muted: createColor("#90A4AE", "rgb(144, 164, 174)", "hsl(200, 15%, 62%)"),
        border: createColor("#2C3B2C", "rgb(44, 59, 44)", "hsl(120, 15%, 20%)"),
        surface: createColor("#243024", "rgb(36, 48, 36)", "hsl(120, 14%, 16%)"),
      },
    },
  },
  semantic: {
    success: createColor("#2E7D32", "rgb(46, 125, 50)", "hsl(123, 46%, 34%)"),
    warning: createColor("#F57C00", "rgb(245, 124, 0)", "hsl(31, 100%, 48%)"),
    error: createColor("#C62828", "rgb(198, 40, 40)", "hsl(0, 67%, 47%)"),
    info: createColor("#1976D2", "rgb(25, 118, 210)", "hsl(208, 79%, 46%)"),
  },
};
