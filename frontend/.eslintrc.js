module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['./node_modules/gts', 'plugin:react/recommended', 'prettier'],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'html'],
  rules: {
    'require-jsdoc': 0,
    'prettier/prettier': 'error',
  },
};
