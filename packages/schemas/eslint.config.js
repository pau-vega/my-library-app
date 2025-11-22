import eslintJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-plugin-prettier";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
    extends: [eslintJs.configs.recommended, tseslint.configs.recommended, eslintConfigPrettier],
    // Configure language/parsing options
    languageOptions: {
      globals: { ...globals.node },
      // Use TypeScript ESLint parser for TypeScript files
      parser: tseslint.parser,
      parserOptions: {
        // Explicitly specify tsconfig for linting
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // Plugins
    plugins: { prettier, perfectionist },

    // Custom rule overrides (modify rule levels or disable rules)
    rules: {
      "perfectionist/sort-imports": ["error", { type: "natural" }],
      "prettier/prettier": [
        "warn",
        {
          endOfLine: "auto",
        },
      ],
    },
  },
]);
