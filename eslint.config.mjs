import { defineConfig } from 'eslint/config'
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import prettier from 'eslint-config-prettier'

// Replaces .eslintrc.json — `next lint` was removed in Next 16, so `npm run lint`
// now invokes the ESLint CLI directly with this flat config.
export default defineConfig([
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      '.claude/**',
      'coverage/**',
      'reports/**',
      'scripts/**',
      'shelter/**',
      'next-env.d.ts',
    ],
  },
  ...coreWebVitals,
  prettier,
  {
    // react-hooks v6 (bundled with eslint-config-next 16) added these rules.
    // The codebase predates them — 24 existing setState-in-effect sites and one
    // Date.now()-in-render. Kept visible as warnings; tighten back to errors
    // once those patterns are cleaned up.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
    },
  },
])
