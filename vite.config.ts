/// <reference types="vitest" />

import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: false,
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts']
  },
  build: {
    lib: {
      entry: './lib/index.ts',
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
  }
})
