module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import", "react", "react-hooks"],
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
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  },
  settings: {
    react: {
      version: "detect"
    }
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