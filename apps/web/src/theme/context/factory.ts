import React from "react";
import { ThemeContextValue } from "../types";
import { ThemeContextError } from "../types/context/error";
import { ThemeContextState } from "../types/context/state";

/**
 * Creates a new Theme Context.
 *
 * @param _options - Options for initializing the context, such as initial state and error handler.
 * @returns A React Context for ThemeContextValue.
 */
export const createThemeContext = (_options?: {
  initialState?: Partial<ThemeContextState>;
  onError?: (error: ThemeContextError) => void;
  debug?: boolean;
}): React.Context<ThemeContextValue> => {
  return React.createContext<ThemeContextValue>({} as ThemeContextValue);
};

/**
 * Creates a Theme Provider component using the provided context.
 * This implementation is a placeholder and should be replaced with actual provider logic.
 *
 * @param Context - The React Context to use for the provider.
 * @returns A React Functional Component for the Theme Provider.
 */
// export const createThemeProvider = (
//     _Context: React.Context<ThemeContextValue>
//   ): React.FC<ThemeProviderProps> => {
//const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, ...props }) => {
//   // Placeholder default value for the context.
//   // Replace this with actual logic to initialize and manage theme state.
//   const defaultValue = {} as ThemeContextValue;

//   return <ThemeContext.Provider value={defaultValue}>{children}</Context.Provider>;
//     };

//     //return ThemeProvider;
//   };

/**
 * Creates a hook for using the Theme Context.
 *
 * @param Context - The React Context for ThemeContextValue.
 * @returns A hook that returns the current ThemeContextValue.
 */
export const createUseThemeContext = (
  Context: React.Context<ThemeContextValue>,
): (() => ThemeContextValue) => {
  return () => {
    const context = React.useContext(Context);
    if (!context) {
      throw new Error("useThemeContext must be used within a ThemeProvider");
    }
    return context;
  };
};
