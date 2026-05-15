module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: '..',
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      allowJs: true,
      isolatedModules: true
    }]
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!JSONStream|rbush|p-limit|lru-cache|yocto-queue)'
  ],
  globals: {
    'ts-jest': {
      allowJs: true,
      isolatedModules: true
    }
  },
  setupFiles: ['<rootDir>/test/jest.setup.js']
};
