// theme/context/component-manager-context.tsx

import { createContext } from "react";
import { ThemeComponentManager } from "./component-theme-manager";


export const ComponentManagerContext = createContext<ThemeComponentManager | null>(null);

interface ComponentManagerProviderProps {
  manager: ThemeComponentManager;
  children: React.ReactNode;
}

export const ComponentManagerProvider: React.FC<ComponentManagerProviderProps> = ({
  manager,
  children
}) => {
  return (
    <ComponentManagerContext.Provider value={manager}>
      {children}
    </ComponentManagerContext.Provider>
  );
};
