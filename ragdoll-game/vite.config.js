import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
<<<<<<<< HEAD:frontend/public/games/ragdoll-game/vite.config.js
  base: './',
========
  plugins: [react()],
>>>>>>>> Archer:ragdoll-game/vite.config.js
  server: {
    port: 5174,
    open: false,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
});
