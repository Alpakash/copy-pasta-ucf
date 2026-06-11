module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: null,
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "react"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  rules: {
    "react/react-in-jsx-scope": "off",
  },
};
