import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // A API é sempre chamada por caminho relativo (RNF-FE-10, RNF-103):
    // em desenvolvimento, /api é repassado ao backend local.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // O Bootstrap 5.3 ainda usa @import e funções globais do Sass; silencia
        // apenas os avisos de depreciação vindos das dependências.
        quietDeps: true,
        silenceDeprecations: ['import'],
      },
    },
  },
})
