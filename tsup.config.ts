import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    clean: true,
    shims: true,
    sourcemap: true,
    dts: false,
})
