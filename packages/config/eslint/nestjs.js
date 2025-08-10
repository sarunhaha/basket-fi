module.exports = {
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  env: {
    node: true,
    jest: true
  },
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
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off"
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