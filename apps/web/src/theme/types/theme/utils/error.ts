// src/types/theme/error.ts
import type { Theme } from '../index';

export class ThemeError extends Error {
    constructor(message: string, type: Theme.ErrorType) {
        super(`[Theme Error: ${type}] ${message}`);
        this.name = 'ThemeError';
    }
}
