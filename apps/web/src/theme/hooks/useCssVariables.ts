export const useCssVariables = () => {
    const applyCssVariables = (variables: Record<string, unknown>) => {
      Object.entries(variables).forEach(([category, values]) => {
        if (values && typeof values === "object") {
          Object.entries(values).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--theme-${category}-${key}`, String(value));
          });
        }
      });
    };

    const getCssVariable = (name: string) => {
      // Implementation of getCssVariable
      const style = getComputedStyle(document.documentElement);
      return style.getPropertyValue(`--${name}`);
    };

    return { applyCssVariables, getCssVariable };
  };
