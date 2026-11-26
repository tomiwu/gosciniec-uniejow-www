import js from '@eslint/js';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';

const eslintConfig = [
  {
    ignores: [
      'out/**',
      '.next/**',
      'node_modules/**',
      '.sandcastle/**',
      '.lighthouseci/**',
      'docs/**',
      'next-env.d.ts',
      'playwright-report/**',
      'test-results/**',
      'coverage/**',
    ],
  },
  js.configs.recommended,
  ...nextCoreWebVitals,
  ...nextTypescript,
  // The next config already registers the jsx-a11y plugin. Add the strict rule set only.
  { files: ['**/*.{jsx,tsx}'], rules: jsxA11y.flatConfigs.strict.rules },
  prettier,
];

export default eslintConfig;
