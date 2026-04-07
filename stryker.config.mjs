/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: 'vitest',
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  mutate: [
    'lib/utils.ts',
    'lib/cart-context.tsx',
    'lib/i18n.tsx',
    'lib/static-data.ts',
  ],
  reporters: ['html', 'clear-text', 'progress'],
  timeoutMS: 30000,
  concurrency: 2,
  vitest: {
    configFile: 'vitest.config.ts',
  },
}
