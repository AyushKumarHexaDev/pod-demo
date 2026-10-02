import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_BASE is set by the GitHub Pages workflow (/<repo-name>/). Locally and on Vercel it is '/'.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
});
