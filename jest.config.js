/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  globals: {
    "ts-jest": {
      tsconfig: 'tsconfig.test.json'
    }
  },
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.{js,ts}']
};