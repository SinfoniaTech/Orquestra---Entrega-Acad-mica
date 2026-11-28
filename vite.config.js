import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Configuracao do Vite para o build do projeto
export default defineConfig({
  plugins: [react()],
  base: '/Orquestra---Entrega-Acad-mica/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'bibliotecas'
        },
      },
    },
  },
})
