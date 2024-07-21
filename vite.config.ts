/// <reference types="vitest" />

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['vitest.setup.ts']
  },
  build: {
    lib: {
      entry: './lib/router.tsx',
      name: 'Router',
      fileName: 'router'
    },
    rollupOptions: {
      external: ['react'],
      output: {
        globals: {
          react: 'React'
        }
      }
    }
  },
  plugins: [
    dts({
      exclude: '**/*.test.*'
    })
  ]
})
