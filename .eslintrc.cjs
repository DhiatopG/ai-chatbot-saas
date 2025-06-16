module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  globals: {
    HTMLDivElement: 'readonly',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'next/core-web-vitals'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react'],
  rules: {},
};
