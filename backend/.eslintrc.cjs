module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'plugin:security/recommended', 'prettier'],
  plugins: ['security'],
  ignorePatterns: ['node_modules/', 'coverage/'],
  overrides: [
    {
      files: ['test/**/*.js'],
      env: { node: true },
      globals: {
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
      },
    },
  ],
};
