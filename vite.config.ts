import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: './lib/router.tsx',
      name: 'Router',
      fileName: 'router'
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react/jsx-runtime': 'JSX'
        }
      }
    }
  }
})
