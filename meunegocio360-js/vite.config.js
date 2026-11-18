import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // A API é chamada sempre por caminho relativo (/api), na mesma origem do frontend (RNF-103).
    // Em desenvolvimento, o Vite repassa essas chamadas ao backend local.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // O Bootstrap 5.3 ainda usa @import e funções globais do Sass; os avisos vêm da biblioteca.
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
      },
    },
  },
})
