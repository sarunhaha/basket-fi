/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports"
      }
    ],
    "import/consistent-type-specifier-style": ["error", "prefer-inline"],
    // Mobile specific
    'import/no-unresolved': 'off', // Expo handles this
  },
  ignorePatterns: [
    "**/.eslintrc.js",
    "**/*.config.js",
    "**/*.config.cjs",
    ".expo",
    "dist",
    "node_modules"
  ],
  reportUnusedDisableDirectives: true,
  env: {
    node: true,
    es6: true,
  },
};