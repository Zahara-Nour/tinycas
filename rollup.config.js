// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
export default [
  {
    // external: ['decimal.js'],
    input: './src/index.js',
    output: 
      {
        file: './dist/tinycas.mjs',
        format: 'es',
      },
      plugins: [nodeResolve()]
    
  },
]
