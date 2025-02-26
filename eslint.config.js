import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
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
  path.resolve(rootDir, "apps/design-system/tsconfig.eslint.json")
);

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.turbo/**',
       "**/design-system/src/*.tsx",
       "**/tailwind.config.js",
       "**/postcss.config.js"
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
        tsconfigRootDir: rootDir,
        project: [
          path.resolve(rootDir, "apps/web/tsconfig.eslint.json"),
          path.resolve(rootDir, "apps/design-system/tsconfig.eslint.json")
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
      'react-hooks': reactHooksPlugin
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

      "semi": ["error", "always"],
      "quotes": ["error", "double"]
    }
  },
  {
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
          path.resolve(rootDir, "apps/design-system/tsconfig.eslint.json")
        ]
      }
    },
    rules: {
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error'
    }
  },
  {
    // Match any file whose name starts with "vite.config."
    files: ["**/vite.config.*", "**/design-system/src/*.tsx"],
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
  }
]
