import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "out/**", ".turbo/**", "coverage/**", "playwright-report/**", "test-results/**", "next-env.d.ts", "tests/vitest-setup.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // React specific rules
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",

      // Next.js specific rules
      "@next/next/no-img-element": "error",

      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": false,
          "ts-nocheck": false,
          "ts-check": false,
        },
      ],

      // General JavaScript/TypeScript rules
      "prefer-const": "error",
      "no-var": "error",
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"]
        }
      ],
      "no-debugger": "error",
      "no-unused-vars": "off", // Use TypeScript version instead
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-duplicate-imports": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-empty": ["error", { allowEmptyCatch: true }],

      // Import/Export rules
      "import/no-duplicates": "error",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index"
          ],
          "newlines-between": "never",
        },
      ],
    },
  },
];

export default eslintConfig;
