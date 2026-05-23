module.exports = {
  root: true,
  extends: ['eslint:recommended'],
  env: {
    node: true,
    jest: true,
    'react-native/react-native': true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    requireConfigFile: false,
  },
  plugins: ['react', 'react-native'],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'warn',
    'react/react-in-jsx-scope': 'off',
  },
};
