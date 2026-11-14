module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['security'],
  extends: ['plugin:security/recommended-legacy'],
  env: {
    node: true,
    es2022: true,
  },
};
