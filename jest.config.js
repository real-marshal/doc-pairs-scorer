module.exports = {
  preset: 'ts-jest',
  rootDir: './src',
  cacheDirectory: '../.cache/jest',
  globalSetup: './test/globalSetup.ts',
  globalTeardown: './test/globalTeardown.ts',
  clearMocks: true,
  collectCoverageFrom: ['**/*.ts'],
  coverageDirectory: '../coverage',
  coverageReporters: ['text'],
  reporters: ['default', 'github-actions'],
  moduleNameMapper: {
    '^@/package.json$': '<rootDir>/../package.json',
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['jest-extended/all'],
  slowTestThreshold: 5,
}
