const fs = require('fs');

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  globals: fs
    .readFileSync('.eslintglobals', 'utf-8')
    .split('\n')
    .filter(Boolean)
    .reduce((acc, line) => {
      const [key, value] = line.split(':');
      acc[key.trim()] = value.trim();
      return acc;
    }, {}),
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react'],
  rules: {},
};
