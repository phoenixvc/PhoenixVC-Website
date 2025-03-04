// theme/providers/ComponentManagerProvider.tsx
import React from "react";
import ComponentManagerContext from "../context/ComponentManagerContext";
import { ComponentManager } from "../core/component-manager";

interface ComponentManagerProviderProps {
  children: React.ReactNode;
  manager: ComponentManager;
}

export const ComponentManagerProvider: React.FC<ComponentManagerProviderProps> = ({
  children,
  manager
}) => {
  return (
    <ComponentManagerContext.Provider value={manager}>
      {children}
    </ComponentManagerContext.Provider>
  );
};
