/** @type {import("jest").Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  testMatch: ["<rootDir>/src/**/*.test.ts?(x)"],
  transformIgnorePatterns: [
    "node_modules/(?!\\.pnpm|((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|expo-router/.*)"
  ]
};
