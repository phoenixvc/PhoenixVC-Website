// theme/context/ThemeContext.ts
import { createContext } from "react";
import { ThemeContextType } from "@/theme/types";

// Export the context directly from here
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default ThemeContext;
