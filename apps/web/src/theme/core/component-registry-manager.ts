// theme/registry/component-registry-manager.ts
import { ComponentThemeRegistry, createComponentRegistry } from "./component-theme-registry";
import { ComponentVariants, ComponentVariantType } from "../types/mappings/component-variants";
import { Theme } from "./theme";

export class ComponentRegistryManager {
  private registry: Map<string, Map<string, ComponentVariantType>> = new Map();

  constructor(initialRegistry?: Partial<ComponentThemeRegistry>) {
    // Initialize with default registry if provided
    const baseRegistry = createComponentRegistry(initialRegistry);
    this.initializeFromObject(baseRegistry);
  }

  /**
   * Initialize registry from a ComponentThemeRegistry object
   */
  private initializeFromObject(registry: Partial<ComponentThemeRegistry>): void {
    Object.entries(registry).forEach(([componentName, variants]) => {
      if (!variants) return;

      const componentMap = new Map<string, ComponentVariantType>();
      this.registry.set(componentName, componentMap);

      Object.entries(variants).forEach(([variantName, variantConfig]) => {
        componentMap.set(variantName, variantConfig as ComponentVariantType);
      });
    });
  }

  /**
   * Register a theme's component variants
   */
  registerTheme(theme: Theme | { components: ComponentVariants }): void {
    // Extract components from the theme
    const { components } = theme;

    if (!components) return;

    // Register each component and its variants
    Object.entries(components).forEach(([componentName, variants]) => {
      if (!variants) return;

      // Create component entry if it doesn't exist
      if (!this.registry.has(componentName)) {
        this.registry.set(componentName, new Map());
      }

      const componentMap = this.registry.get(componentName)!;

      // Register each variant
      Object.entries(variants).forEach(([variantName, variantConfig]) => {
        componentMap.set(variantName, variantConfig as ComponentVariantType);
      });
    });
  }

  /**
   * Get a component variant with improved typing
   * This overload allows for strongly-typed component names when available
   */
  getVariant<T extends keyof ComponentThemeRegistry, V extends keyof ComponentThemeRegistry[T]>(
    component: T,
    variant: V
  ): ComponentThemeRegistry[T][V];

  getVariant<T extends keyof ComponentThemeRegistry>(
    component: T,
    variant: string
  ): ComponentVariantType | undefined;

  // Then provide a single implementation that handles all cases
  getVariant<T extends keyof ComponentThemeRegistry>(
    component: T,
    variant: string
  ): ComponentVariantType | undefined {
    const componentVariants = this.getComponentVariants(component);
    if (!componentVariants) return undefined;
    return componentVariants[variant] as ComponentVariantType;
  }


  getComponentVariants<T extends keyof ComponentThemeRegistry>(
    component: T
  ): ComponentThemeRegistry[T] | undefined;

  getComponentVariants(
    component: string
  ): Record<string, ComponentVariantType> | undefined;

  // Single implementation for both overloads
  getComponentVariants(
    component: string
  ): Record<string, ComponentVariantType> | undefined {
    const registry = this.getRegistry();
    return registry[component];
  }

  /**
   * Set a component variant
   */
  setVariant<T extends ComponentVariantType>(
    component: string,
    variant: string,
    value: T
  ): void {
    // Create component entry if it doesn't exist
    if (!this.registry.has(component)) {
      this.registry.set(component, new Map());
    }

    const componentMap = this.registry.get(component)!;
    componentMap.set(variant, value);
  }

  /**
   * Check if a component variant exists
   */
  hasVariant(component: string, variant: string = "default"): boolean {
    const componentMap = this.registry.get(component);
    return componentMap ? componentMap.has(variant) : false;
  }


  /**
   * Get the entire registry as a ComponentThemeRegistry object
   */
  getRegistry(): ComponentThemeRegistry {
    // Start with required components
    const registry = {
      button: {},
      input: {},
    } as ComponentThemeRegistry;

    this.registry.forEach((variantMap, componentName) => {
      const variants: Record<string, ComponentVariantType> = {};
      variantMap.forEach((value, key) => {
        variants[key] = value;
      });

      // Now TypeScript knows that registry can have string keys
      registry[componentName] = variants;
    });

    return registry;
  }

  /**
   * Get all component variants from the registry
   * @param filter Optional filter to include only specific components
   * @returns Filtered copy of the component registry
   */
  getAllComponentVariants(filter?: Array<keyof ComponentThemeRegistry>): Partial<ComponentThemeRegistry> {
    const registry = this.getRegistry();

    if (!filter || filter.length === 0) {
      return { ...registry };
    }

    const filteredRegistry: Partial<ComponentThemeRegistry> = {};

    for (const component of filter) {
      if (registry[component]) {
        filteredRegistry[component] = { ...registry[component] };
      }
    }

    return filteredRegistry;
  }

  /**
   * Clear the registry
   */
  clear(): void {
    this.registry.clear();
  }

  /**
   * Reset the registry to default values
   */
  resetToDefaults(defaultRegistry: Partial<ComponentThemeRegistry>): void {
    this.clear();
    this.initializeFromObject(defaultRegistry);
  }

  /**
   * Remove a component from the registry
   */
  removeComponent(component: string): boolean {
    return this.registry.delete(component);
  }

  /**
   * Remove a specific variant from a component
   */
  removeVariant(component: string, variant: string): boolean {
    const componentMap = this.registry.get(component);
    if (!componentMap) return false;

    return componentMap.delete(variant);
  }

  /**
   * Get all component names in the registry
   */
  getComponentNames(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Get all variant names for a component
   */
  getVariantNames(component: string): string[] {
    const componentMap = this.registry.get(component);
    if (!componentMap) return [];

    return Array.from(componentMap.keys());
  }
}
