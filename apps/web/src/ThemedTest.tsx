// src/components/ThemedTest.tsx
import React from 'react';
import { useTheme } from '@/theme';
import "./theme/theme.css"

const ThemedTest: React.FC = () => {
  const { colorScheme, mode, colorSchemeClasses } = useTheme();
  return (
    <div className="p-4" style={{ backgroundColor: "hsl(var(--color-background))", color: "hsl(var(-color-foreground))" }}>
      <h1 className={colorSchemeClasses.text}>Current Theme: {colorScheme}</h1>
      <p>Active mode: {mode}</p>
    </div>
  );
};

export default ThemedTest;
