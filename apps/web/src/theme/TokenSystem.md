# Theme Token System

This document outlines different approaches for implementing a theme token system with keywords and search capabilities.

## Overview

The theme token system provides multiple ways to organize, search, and manage design tokens within your theme. Below are five different approaches, each serving different use cases and requirements.

## Implementation Approaches

### 1. Path-Based Theme Tokens

Organizes tokens in a hierarchical structure with metadata and keywords for enhanced searchability.

```typescript
interface ThemeToken {
    path: string;        // e.g., "colors.primary.500"
    value: string;       // e.g., "#1E40AF"
    keywords: string[];  // e.g., ["blue", "primary", "brand"]
    metadata?: {
        category: string;
        description?: string;
        usageExamples?: string[];
    }
}
```

**Benefits:**
- Clear hierarchical organization
- Rich metadata support
- Flexible keyword assignment
- Easy to track token usage

### 2. Semantic Grouping System

Groups tokens based on their semantic meaning and usage context.

```typescript
type SemanticGroup = {
    intent: "primary" | "secondary" | "accent" | "neutral";
    context: "background" | "text" | "border" | "interactive";
    state?: "default" | "hover" | "active" | "disabled";
    keywords: string[];
}
```

**Benefits:**
- Semantic organization
- Clear usage contexts
- State management
- Consistent design patterns

### 3. Alias System with Keywords

Provides multiple ways to reference the same token while maintaining a single source of truth.

```typescript
interface ThemeAlias {
    value: string;
    baseToken: string;  // Reference to original token
    aliases: string[];  // Alternative names
    tags: string[];     // Searchable tags/keywords
}
```

**Example:**
```typescript
const aliases = {
    "brand-blue": {
        value: "#1E40AF",
        baseToken: "colors.primary.500",
        aliases: ["corporateBlue", "mainBlue"],
        tags: ["brand", "primary", "corporate"]
    }
}
```

### 4. Hierarchical Category System

Organizes tokens in a tree structure with nested categories and keywords.

```typescript
interface CategoryNode {
    name: string;
    keywords: string[];
    children?: CategoryNode[];
    values?: Record<string, string>;
}
```

**Benefits:**
- Nested organization
- Category-level keywords
- Flexible depth
- Grouped values

### 5. Search Index Integration

Provides powerful search capabilities for finding and suggesting tokens.

```typescript
interface ThemeSearchIndex {
    addToken: (path: string, keywords: string[]) => void;
    search: (query: string) => string[];  // Returns matching paths
    suggest: (partial: string) => string[];  // Keyword suggestions
    getRelated: (path: string) => string[];  // Related tokens
}
```

## Usage Recommendations

Choose your implementation approach based on your specific needs:

| Approach | Best For |
|----------|----------|
| Path-Based | Large design systems with complex hierarchies |
| Semantic Groups | Design systems focusing on consistent patterns |
| Alias System | Projects requiring backward compatibility |
| Hierarchical Categories | Complex theme organization |
| Search Index | Large-scale systems needing quick token lookup |

## Combining Approaches

You can combine multiple approaches for more robust functionality. Common combinations include:

- Path-Based + Search Index: Organized structure with powerful search
- Semantic Groups + Alias System: Consistent patterns with flexible naming
- Hierarchical Categories + Search Index: Complex organization with easy discovery

## Implementation Example

```typescript
// Example combining Path-Based and Search Index approaches
const themeSystem = {
    tokens: new Map<string, ThemeToken>(),
    searchIndex: createThemeSearchIndex(),

    addToken(token: ThemeToken) {
        this.tokens.set(token.path, token);
        this.searchIndex.addToken(token.path, token.keywords);
    },

    search(query: string) {
        return this.searchIndex.search(query)
            .map(path => this.tokens.get(path));
    }
};
```

## Contributing

When adding new tokens or modifying existing ones:

1. Follow the established pattern for your chosen approach
2. Include relevant keywords for searchability
3. Add appropriate metadata and documentation
4. Update tests to cover new tokens
5. Update documentation if adding new patterns

## Further Reading

- [Design Tokens Overview](link-to-docs)
- [Theme System Architecture](link-to-docs)
- [Contributing Guidelines](link-to-docs)
