const browserGlobals = {
  caches: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  getComputedStyle: 'readonly',
  indexedDB: 'readonly',
  localStorage: 'readonly',
  location: 'readonly',
  navigator: 'readonly',
  self: 'readonly',
  sessionStorage: 'readonly',
  URL: 'readonly',
  window: 'readonly'
};

const nodeGlobals = {
  Buffer: 'readonly',
  console: 'readonly',
  process: 'readonly'
};

export default [
  { ignores: ['dist/**', 'node_modules/**', 'target/**', 'test-results/**', 'playwright-report/**', 'graphify-out/**'] },
  {
    files: ['site/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: browserGlobals },
    rules: { 'no-undef': 'error', 'no-unused-vars': 'error' }
  },
  {
    files: ['tests/**/*.js', '*.config.js', 'scripts/**/*.mjs'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...browserGlobals, ...nodeGlobals } },
    rules: { 'no-undef': 'error', 'no-unused-vars': 'error' }
  }
];
