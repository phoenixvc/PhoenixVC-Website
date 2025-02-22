// src/types/theme/plugin.ts
import type { ThemeConfig } from '../core/config';

export interface ThemePlugin {
    name: string;
    version: string;
    install: (config: ThemeConfig) => void;
    uninstall?: (config: ThemeConfig) => void;
}
