module.exports = {
  jest: {
    configure: (jestConfig) => {
      jestConfig.transformIgnorePatterns = [
        '/node_modules/(?!antd|@ant-design|rc-|axios)/',
      ];

      // Add explicit transform for JSX files
      jestConfig.transform = {
        ...jestConfig.transform,
        '^.+\.(js|jsx|ts|tsx)$': ['babel-jest', {
          presets: [
            ['@babel/preset-env', { targets: { node: 'current' } }],
            ['@babel/preset-react', { runtime: 'automatic' }]
          ]
        }],
      };

      jestConfig.moduleNameMapper = {
        ...jestConfig.moduleNameMapper,
        '^antd(.*)$': '<rootDir>/node_modules/antd$1',
      };

      return jestConfig;
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  },
};