import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/oyunsbot/',  // GitHub repo нэрээ солино
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
