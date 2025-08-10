module.exports = {
  root: true,
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
    "import/consistent-type-specifier-style": ["error", "prefer-inline"]
  },
  ignorePatterns: [
    "**/.eslintrc.js",
    "**/*.config.js",
    "**/*.config.cjs",
    "dist",
    "node_modules"
  ],
  reportUnusedDisableDirectives: true
};