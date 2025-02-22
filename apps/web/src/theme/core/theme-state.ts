// core/theme-state.ts

import { ColorScheme, Mode, ThemeState as IThemeState } from '../types/theme.types';
import { ThemeStorage } from '../utils/theme-storage';
import { isValidColorScheme, isValidMode } from '../utils/theme-validation';
import { THEME_CONSTANTS } from '../constants/theme-constants';

/**
 * Manages the global theme state using the Singleton pattern
 * @class ThemeState
 */
export class ThemeState {
    private static instance: ThemeState;
    
    // State properties
    private currentColorScheme!: ColorScheme;
    private currentMode!: Mode;
    private systemMode!: Mode;
    private useSystemMode!: boolean;
    private initialized: boolean = false;
    
    // DOM-related properties
    private listeners: Set<() => void>;
    private mediaQuery: MediaQueryList | null;

    private constructor() {
        // Initialize state
        this.initializeState();
        
        // Setup properties
        this.listeners = new Set();
        this.mediaQuery = null;
        this.initialized = false;

        // Initialize system if in browser
        if (typeof window !== 'undefined') {
            this.initialize();
        }
    }

    /**
     * Initialize the state with stored values or defaults
     */
    private initializeState(): void {
        this.currentColorScheme = this.getStoredOrDefaultColorScheme();
        this.currentMode = this.getStoredOrDefaultMode();
        this.systemMode = this.getInitialSystemMode();
        this.useSystemMode = Boolean(ThemeStorage.getUseSystem());
    }

    private getStoredOrDefaultColorScheme(): ColorScheme {
        const storedScheme = ThemeStorage.getColorScheme();
        return storedScheme && isValidColorScheme(storedScheme)
            ? storedScheme
            : 'classic';
    }

    private getStoredOrDefaultMode(): Mode {
        const storedMode = ThemeStorage.getMode();
        return storedMode && isValidMode(storedMode)
            ? storedMode
            : 'light';
    }

    /**
     * Get singleton instance
     */
    static getInstance(): ThemeState {
        if (!ThemeState.instance) {
            ThemeState.instance = new ThemeState();
        }
        return ThemeState.instance;
    }

    /**
     * Initialize theme system
     */
    private initialize(): void {
        if (this.initialized) return;

        this.initializeSystemModeListener();
        this.applyTheme();
        this.initialized = true;
    }

    /**
     * System mode detection and handling
     */
    private getInitialSystemMode(): Mode {
        if (typeof window === 'undefined') return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    private initializeSystemModeListener(): void {
        if (typeof window === 'undefined') return;

        try {
            this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = this.handleSystemModeChange.bind(this);

            // Initial check
            handleChange(this.mediaQuery);

            // Add listener with fallback
            if (this.mediaQuery.addEventListener) {
                this.mediaQuery.addEventListener('change', handleChange);
            } else {
                this.mediaQuery.addListener(handleChange);
            }
        } catch (error) {
            console.error('[ThemeState] Error initializing system mode listener:', error);
            this.handleSystemModeError();
        }
    }

    private handleSystemModeChange(e: MediaQueryListEvent | MediaQueryList): void {
        this.systemMode = e.matches ? 'dark' : 'light';
        if (this.useSystemMode) {
            this.applyTheme();
        }
        this.notify();
    }

    private handleSystemModeError(): void {
        this.systemMode = 'light';
        this.useSystemMode = false;
    }

    /**
     * Theme application and DOM updates
     */
    private applyTheme(): void {
        if (typeof window === 'undefined') return;

        try {
            const mode = this.useSystemMode ? this.systemMode : this.currentMode;
            const root = document.documentElement;

            // Update DOM
            this.updateRootClasses(root, mode);
            this.dispatchThemeChangeEvent(mode);
        } catch (error) {
            console.error('[ThemeState] Error applying theme:', error);
        }
    }

    private updateRootClasses(root: HTMLElement, mode: Mode): void {
        root.classList.remove('light', 'dark');
        root.classList.add(mode);
        root.setAttribute('data-theme', this.currentColorScheme);
    }

    private dispatchThemeChangeEvent(mode: Mode): void {
        window.dispatchEvent(new CustomEvent(THEME_CONSTANTS.EVENTS.CHANGE, {
            detail: { 
                mode, 
                colorScheme: this.currentColorScheme 
            }
        }));
    }

    /**
     * State management methods
     */
    setColorScheme(scheme: ColorScheme): void {
        if (!isValidColorScheme(scheme)) {
            console.warn('[ThemeState] Invalid color scheme provided');
            return;
        }

        try {
            this.currentColorScheme = scheme;
            ThemeStorage.saveColorScheme(scheme);
            this.applyTheme();
            this.notify();
        } catch (error) {
            console.error('[ThemeState] Error setting color scheme:', error);
        }
    }

    setMode(mode: Mode): void {
        if (!isValidMode(mode)) {
            console.warn('[ThemeState] Invalid mode provided');
            return;
        }

        try {
            this.currentMode = mode;
            this.useSystemMode = false;
            ThemeStorage.saveMode(mode);
            ThemeStorage.saveUseSystem(false);
            this.applyTheme();
            this.notify();
        } catch (error) {
            console.error('[ThemeState] Error setting mode:', error);
        }
    }

    setUseSystemMode(useSystem: boolean): void {
        try {
            this.useSystemMode = useSystem;
            ThemeStorage.saveUseSystem(useSystem);
            this.applyTheme();
            this.notify();
        } catch (error) {
            console.error('[ThemeState] Error setting system mode:', error);
        }
    }

    /**
     * Observer pattern implementation
     */
    subscribe(listener: () => void): () => void {
        if (!listener || typeof listener !== 'function') {
            throw new Error('[ThemeState] Invalid listener provided');
        }

        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify(): void {
        try {
            this.listeners.forEach(listener => listener());
        } catch (error) {
            console.error('[ThemeState] Error notifying listeners:', error);
        }
    }

    /**
     * Public getters
     */
    getState(): IThemeState {
        return {
            colorScheme: this.currentColorScheme,
            mode: this.useSystemMode ? this.systemMode : this.currentMode,
            systemMode: this.systemMode,
            useSystemMode: this.useSystemMode,
            initialized: this.initialized,
        };
    }

    /**
     * Cleanup method (primarily for testing)
     */
    destroy(): void {
        if (this.mediaQuery) {
            this.mediaQuery = null;
        }
        this.listeners.clear();
        this.initialized = false;
    }
}

// Export singleton instance
export default ThemeState.getInstance();
