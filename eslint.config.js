// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
// @ts-ignore
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const rootDir = process.cwd();

console.log("ESLint Root Directory:", rootDir);
console.log(
  "ESLint Project Paths:",
  path.resolve(rootDir, "apps/web/tsconfig.eslint.json"),
  path.resolve(rootDir, "apps/design-system/tsconfig.eslint.json"),
  path.resolve(rootDir, "apps/api/tsconfig.eslint.json"),
  path.resolve(rootDir, "tsconfig.eslint.json")
);

export default [{
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/.next/**',
    '**/.turbo/**',
     "**/design-system/src/*.tsx",
     "**/tailwind.config.js",
     "**/postcss.config.js",
     "types/eslint-plugin-react-hooks.d.ts",
     "**/srcs/**",
     "**/.storybook/**",
     "**/*.shims.d.ts"
  ]
}, js.configs.recommended, {
  files: ['apps/web/**/*.{js,jsx,ts,tsx}'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      },
      tsconfigRootDir: path.resolve(rootDir, 'apps/web'),
      project: [
        './tsconfig.json'
      ]
    },
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.es2021,
      React: "writable"
    }
  },
  plugins: {
    '@typescript-eslint': typescript,
    'react': reactPlugin,
    'react-hooks': reactHooksPlugin,
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // TypeScript rules
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'warn',
    "no-unused-vars": "warn",

    // React rules
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-dupe-class-members': 'off',
    '@typescript-eslint/no-dupe-class-members': ['error'],

    "semi": ["error", "always"],
    "quotes": ["error", "double"]
  }
}, {
  files: ['apps/design-system/**/*.{js,jsx,ts,tsx}'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      },
      tsconfigRootDir: path.resolve(rootDir, 'apps/design-system'),
      project: [
        './tsconfig.json'
      ]
    },
    globals: {
      ...globals.browser,
      ...globals.es2021,
      React: "writable"
    }
  },
  plugins: {
    '@typescript-eslint': typescript,
    'react': reactPlugin,
    'react-hooks': reactHooksPlugin,
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'warn',
    "no-unused-vars": "warn",
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
  }
}, {
  files: ['apps/api/**/*.{js,jsx,ts,tsx}'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      tsconfigRootDir: path.resolve(rootDir, 'apps/api'),
      project: [
        './tsconfig.json'
      ]
    },
    globals: {
      ...globals.node,
      ...globals.es2021
    }
  },
  plugins: {
    '@typescript-eslint': typescript,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  }
}, {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
      tsconfigRootDir: rootDir,
      project: [
        path.resolve(rootDir, "apps/web/tsconfig.eslint.json"),
        path.resolve(rootDir, "apps/design-system/tsconfig.eslint.json"),
        path.resolve(rootDir, "apps/api/tsconfig.eslint.json")
      ]
    }
  },
  rules: {
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error'
  }
}, {
  // Match any file whose name starts with "vite.config." or Azure Functions config files
  files: [
    "**/vite.config.*",
    "**/design-system/src/*.tsx",
    "**/api/host.json",
    "**/api/local.settings.json"
  ],
  languageOptions: {
    parserOptions: {
      project: null,
      allowDefaultProject: true,
      tsconfigRootDir: rootDir
    }
  },
  rules: {
    '@typescript-eslint/await-thenable': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-unused-vars': 'off',
  }
}, {
  files: ["**/api/src/**/*.ts"],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn', // Sometimes needed for HTTP request/response handling
    '@typescript-eslint/explicit-function-return-type': 'error', // Enforce return types for Azure Functions
  }
}, ...storybook.configs["flat/recommended"]];
