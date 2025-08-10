module.exports = {
  root: true,
  extends: ["@basket-fi/config/eslint/base.js"],
  plugins: ["react", "react-hooks"],
  rules: {
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  },
  settings: {
    react: {
      version: "detect"
    }
  }
};