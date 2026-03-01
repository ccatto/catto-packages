// .prettierrc.mjs
export default {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'always',

  plugins: [
    'prettier-plugin-packagejson',
    '@ianvs/prettier-plugin-sort-imports',
  ],

  importOrder: [
    '^react',
    '^next(/.*)?$',
    '<THIRD_PARTY_MODULES>',
    '^(@catto)(/.*|$)',
    '^[./]',
  ],
  importOrderSortSpecifiers: true,
};
