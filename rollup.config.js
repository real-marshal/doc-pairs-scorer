const typescript = require('@rollup/plugin-typescript')

export default {
  input: 'openapi_typescript_codegen/index.ts',
  output: {
    file: './src/assets/api.js',
  },
  plugins: [
    typescript({
      include: 'openapi_typescript_codegen/**',
      tsconfig: false,
      target: 'es2020',
      module: 'es2020',
    }),
  ],
}
