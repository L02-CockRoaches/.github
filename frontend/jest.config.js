module.exports = {
  preset: "jest-expo",

  // Bỏ qua native modules, chỉ transform code cần thiết
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native|expo|@expo|expo-router))"
  ],

  moduleNameMapper: {
    "^expo/src/winter(.*)$": "<rootDir>/__mocks__/expoWinterMock.js", // Fix Expo ESM
    "^@/(.*)$": "<rootDir>/$1",                                        // Alias @/
    "\\.(png|jpg|svg)$": "<rootDir>/__mocks__/fileMock.js"            // Mock ảnh
  },

  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "/backend/"],
  coverageProvider: "v8",

  // Đo coverage cho app/, services/ và utils/
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "services/**/*.ts",
    "utils/**/*.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/sentry-example-page/**",
    "!**/api/sentry-example-api/**",
    "!app/global-error.tsx",
    "!app/**/_layout.tsx",
    "!app/(tabs)/explore.tsx"
  ],
  coverageReporters: ["lcov", "text", "text-summary", "html"],  // html cho artifact, lcov cho SonarCloud
  coverageDirectory: "coverage",
};

