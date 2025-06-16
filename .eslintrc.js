module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['next', 'next/core-web-vitals', 'eslint:recommended'],
  rules: {
    'no-undef': 'off',
  },
}
