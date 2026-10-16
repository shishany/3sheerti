// Expo SDK 51 only detects Yarn-style `workspaces` in package.json, not pnpm-workspace.yaml,
// so without this Metro watches apps/mobile alone and cannot resolve packages that pnpm
// installs under the workspace root's node_modules ("Unable to resolve module
// .../expo-router/entry.js").
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules")
];

module.exports = config;
