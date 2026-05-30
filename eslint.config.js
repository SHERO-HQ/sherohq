import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  globalIgnores([
    "dist",
    "server/dist",
    ".next",
    "**/*.test.ts",
    "**/*.test.tsx",
    "tests/**/*",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "no-empty": "warn",
    },
  },
  // Next.js App Router layouts/pages export metadata + viewport alongside components
  // and the router-compat shim exports both components and hooks by design
  {
    files: [
      "src/app/**/layout.tsx",
      "src/app/**/page.tsx",
      "src/lib/router-compat.tsx",
    ],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  // Admin views with complex handlers
  {
    files: ["src/views/admin/*.tsx"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
]);
