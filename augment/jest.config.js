module.exports = {
  testEnvironment: 'jsdom',
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'public/js/**/*.js',
    'public/scss/**/*.scss',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],
  transform: {},
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/mocks/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/mocks/fileMock.js'
  }
};
