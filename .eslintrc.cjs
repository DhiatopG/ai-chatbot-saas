module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'next',
  ],
  plugins: ['@typescript-eslint', 'react'],
  rules: {
    'no-undef': 'off',
  },
  globals: {
    HTMLDivElement: 'readonly',
  },
}
