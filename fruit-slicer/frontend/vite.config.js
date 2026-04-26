import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Yo line thapa

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Yo line pani thapa
  ],
})