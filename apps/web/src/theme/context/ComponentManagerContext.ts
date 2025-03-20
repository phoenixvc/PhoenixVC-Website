// theme/context/ComponentManagerContext.ts
import { createContext } from "react";
import { ComponentManager } from "../managers/component-manager";

export const ComponentManagerContext = createContext<ComponentManager | undefined>(undefined);

export default ComponentManagerContext;
