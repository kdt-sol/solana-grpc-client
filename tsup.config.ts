import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts', 'src/clients/corvus-arpc/index.ts', 'src/clients/jetstream/index.ts', 'src/clients/yellowstone/index.ts', 'src/clients/thor-streamer/index.ts', 'src/clients/shreder/index.ts'],
    format: ['esm', 'cjs'],
    clean: true,
    shims: true,
    sourcemap: true,
    dts: false,
})
