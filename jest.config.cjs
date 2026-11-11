module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/testSetup.ts'],
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/src/testStyleMock.cjs',
    '\\.(svg|png)$': '<rootDir>/src/testAssetMock.cjs',
  },
}
