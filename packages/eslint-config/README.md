# @copy-pasta/eslint-config

Shared ESLint configuration for all Copy Pasta Formaggi packages. Extends TypeScript strict rules with project-specific overrides.

## Install

```bash
pnpm add -D @copy-pasta/eslint-config
```

## Usage

In your `.eslintrc.cjs`:

```js
module.exports = {
  root: true,
  extends: ["@copy-pasta/eslint-config"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
```

## License

MIT
