module.exports = {
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier",
    "next/core-web-vitals"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import", "react", "react-hooks", "jsx-a11y"],
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
    "react/react-in-jsx-scope": "off",
    "jsx-a11y/alt-text": [
      "warn",
      {
        elements: ["img"],
        img: ["Image"]
      }
    ],
    "jsx-a11y/aria-props": "warn",
    "jsx-a11y/aria-proptypes": "warn",
    "jsx-a11y/aria-unsupported-elements": "warn",
    "jsx-a11y/role-has-required-aria-props": "warn",
    "jsx-a11y/role-supports-aria-props": "warn"
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
    ".next",
    "dist",
    "node_modules"
  ],
  reportUnusedDisableDirectives: true
};