const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch monorepo root so Metro can see hoisted packages
config.watchFolders = [monorepoRoot];

// Resolve modules from workspace-local node_modules first, then monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Fix monorepo entry-file resolution: the Gradle plugin passes --entry-file relative to
// apps/mobile, but @expo/metro-config sets unstable_serverRoot to the workspace root.
// These are incompatible — override to keep serverRoot at apps/mobile.
config.server.unstable_serverRoot = projectRoot;

module.exports = withNativeWind(config, { input: './global.css' });
