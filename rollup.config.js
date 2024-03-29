// rollup.config.js
// import { nodeResolve } from '@rollup/plugin-node-resolve';
export default [
  {
    external: ['decimal.js'],
    input: './src/index.js',
    output: [
      {
        file: './dist/tinycas.mjs',
        format: 'es',
      },
      {
        format: 'umd',
        name: 'tinycas',
        file: `./dist/index.js`,
      },
    ]
      // plugins: [nodeResolve()]
    
  },
]
