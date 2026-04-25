module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/__tests__/**/*.spec.ts',
    '**/__tests__/**/*.spec.tsx',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/backend/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@screens/(.*)$': '<rootDir>/screens/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@constants/(.*)$': '<rootDir>/constants/$1',
    '^@types/(.*)$': '<rootDir>/types/$1',
    '^@scripts/(.*)$': '<rootDir>/scripts/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg))',
  ],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.expo/**',
  ],
};
