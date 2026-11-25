import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Bibliotecas (React, React Router, Bootstrap) em um pacote separado do codigo da aplicacao.
        // Os dois pacotes carregam juntos na abertura da pagina (nao ha carregamento sob demanda);
        // a separacao apenas mantem cada arquivo abaixo do limite de aviso de tamanho do Vite.
        manualChunks(id) {
          if (id.includes('node_modules')) return 'bibliotecas'
        },
      },
    },
  },
})
