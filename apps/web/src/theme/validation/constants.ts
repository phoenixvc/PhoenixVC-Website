import { ThemeName, ThemeMode } from "@/theme/types";

export const REQUIRED_BASE_COLORS = ["primary", "secondary", "accent"] as const;

export const REQUIRED_MODE_COLORS = ["background", "text", "border"] as const;

export const VALID_COLOR_SCHEMES: ThemeName[] = ["classic"];

export const VALID_MODES: ThemeMode[] = ["light", "dark"];
