import eslintReact from "@eslint-react/eslint-plugin"
import eslintJs from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier/flat"
import perfectionist from "eslint-plugin-perfectionist"
import prettier from "eslint-plugin-prettier"
import { defineConfig } from "eslint/config"
import tseslint from "typescript-eslint"

export default defineConfig([
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["dist/**", "node_modules/**"],
    // Extend recommended rule sets from:
    // 1. ESLint JS's recommended rules
    // 2. TypeScript ESLint recommended rules
    // 3. ESLint React's recommended-typescript rules
    extends: [
      eslintJs.configs.recommended,
      tseslint.configs.recommended,
      eslintReact.configs["recommended-typescript"],
      eslintConfigPrettier,
    ],

    // Configure language/parsing options
    languageOptions: {
      // Use TypeScript ESLint parser for TypeScript files
      parser: tseslint.parser,
      parserOptions: {
        // Enable project service for better TypeScript integration

        tsconfigRootDir: import.meta.dirname,
      },
    },

    // Plugins
    plugins: { prettier, perfectionist },

    // Custom rule overrides (modify rule levels or disable rules)
    rules: {
      "perfectionist/sort-imports": ["error", { type: "natural" }],
      "prettier/prettier": "warn",
      "no-empty-pattern": "off",
    },
  },
])
