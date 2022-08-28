const typescript = require('@rollup/plugin-typescript')

// eslint-disable-next-line no-undef
module.exports = {
  input: './src/index.ts',
  output: [
    {
      format: 'umd',
      name: 'pigment',
      file: 'dist/pigment.umd.js'
    },
    {
      format: 'cjs',
      file: 'dist/pigment.commonjs.js'
    },
    {
      format: 'es',
      file: 'dist/pigment.es.js'
    }
  ],
  plugins: [typescript()]
}
