import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'src/index.ts',
    'vitest.config.ts',
    'tests/**/*.test.ts',
  ],

  project: [
    'src/**/*.ts',
    'tests/**/*.ts',
  ],

  rules: {
    files: 'error',
    dependencies: 'error',
    devDependencies: 'error',
    optionalPeerDependencies: 'error',
    unlisted: 'error',
    binaries: 'error',
    unresolved: 'error',
    exports: 'error',
    types: 'error',
    nsExports: 'error',
    nsTypes: 'error',
    duplicates: 'error',
    enumMembers: 'error',
  },

  includeEntryExports: true,
  ignoreExportsUsedInFile: false,

  typescript: true,
  eslint: true,
  vitest: true,

  ignoreDependencies: [
    'openclaw',
    'tsx',
  ],

  ignoreFiles: [
    'check-common.ts',
  ],
};

export default config;
