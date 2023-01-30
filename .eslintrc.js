const TSExtends = [
  'plugin:@typescript-eslint/recommended',
  'plugin:@typescript-eslint/recommended-requiring-type-checking',
  'plugin:@typescript-eslint/strict',
  'plugin:import/typescript',
]

const TSParserOptions = {
  ecmaVersion: 2022,
  project: './tsconfig.json',
}

const disabledCommonRules = [
  'one-var',
  'sort-keys',
  'sort-imports',
  'require-unicode-regexp',
  'multiline-comment-style',
  'max-lines-per-function',
  'no-ternary',
  'no-plusplus',
  'id-length',
  'capitalized-comments',
  'no-warning-comments',
  'consistent-return',
  'max-statements',
  'no-magic-numbers',
  'no-shadow',
  'lines-between-class-members',
  'init-declarations',
  'max-params',
  'sort-vars',
  'no-inline-comments',
  'no-undefined',
  'no-negated-condition',
  'no-multi-assign',
  'no-underscore-dangle',
  'arrow-body-style',
  'no-void',
  'func-style',
  'new-cap',
  'unicorn/prefer-module',
  'unicorn/no-null',
  'unicorn/no-document-cookie',
  'unicorn/no-console-spaces',
  'unicorn/filename-case',
  'unicorn/import-style',
  'unicorn/explicit-length-check',
  'unicorn/no-array-reduce',
  'unicorn/no-array-for-each',
  'unicorn/no-array-callback-reference',
  'unicorn/prefer-object-from-entries',
  'unicorn/prevent-abbreviations',
  'unicorn/no-new-array',
  'unicorn/no-await-expression-member',
  'unicorn/consistent-function-scoping',
  'unicorn/catch-error-name',
  'unicorn/no-process-exit',
  'unicorn/template-indent',
  'unicorn/no-negated-condition'
]

const commonRules = {
  ...disabledCommonRules.reduce((result, rule) => ({ ...result, [rule]: 'off' }), {}),
  'no-unused-expressions': ['error', { allowShortCircuit: true }],
}

const disabledTSRules = [
  '@typescript-eslint/no-non-null-assertion',
  '@typescript-eslint/non-nullable-type-assertion-style',
  '@typescript-eslint/require-await',
]

const TSRules = {
  ...disabledTSRules.reduce((result, rule) => ({ ...result, [rule]: 'off' }), {}),
  '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
  '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
}

module.exports = {
  ignorePatterns: ['dist/**'],
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: ['eslint:all', 'plugin:import/recommended', 'plugin:unicorn/recommended', 'prettier'],
  plugins: ['import'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        node: true,
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  rules: commonRules,
  overrides: [
    {
      files: ['*.{ts,tsx}'],
      extends: TSExtends,
      plugins: ['@typescript-eslint'],
      parser: '@typescript-eslint/parser',
      parserOptions: TSParserOptions,
      rules: TSRules,
    },
    {
      files: ['*.test.{ts,tsx}'],
      env: { jest: true },
      extends: [
        ...TSExtends,
        'plugin:jest/recommended',
        'plugin:jest/style',
        'plugin:jest-extended/all',
      ],
      plugins: ['@typescript-eslint', 'jest'],
      parser: '@typescript-eslint/parser',
      parserOptions: TSParserOptions,
      rules: {
        ...TSRules,
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/dot-notation': 'off',
      },
    },
  ],
}
