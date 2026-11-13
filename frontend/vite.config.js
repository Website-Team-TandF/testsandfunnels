/* vite.config.js
   Dev server for the React dashboard. The proxy forwards /api/* to the Express
   backend on :5000, so the frontend calls "/api/..." with no CORS fuss. */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:5000' },
  },
});
