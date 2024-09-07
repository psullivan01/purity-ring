import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const preferBuiltins = true;
const isDebug = process.env.DEBUG === 'true';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/esm/index.js',
      format: 'es',
      sourcemap: true,
      exports: 'auto',
    },
    plugins: [
      resolve({ preferBuiltins }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
      }),
      !isDebug && terser(),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/cjs/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      resolve({ preferBuiltins }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.cjs.json',
      }),
      !isDebug && terser(),
    ],
  },
];
