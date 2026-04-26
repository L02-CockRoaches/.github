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

  // Đo coverage cho app/ và src/
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "src/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**"
  ],
  coverageReporters: ["lcov", "text", "text-summary", "html"],  // html cho artifact, lcov cho SonarCloud
  coverageDirectory: "coverage",
};

