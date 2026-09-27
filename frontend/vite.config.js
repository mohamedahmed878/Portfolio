import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Makes deep links like /app/dashboard/expenses work on refresh in dev & preview
// (Vite's dev/preview servers only know about the *.html entry files by default;
// this rewrites any non-file /app/... request to app/index.html so React Router
// can take over client-side routing.)
function appSpaFallback() {
  const rewrite = (req, res, next) => {
    if (req.url.startsWith('/app') && !path.extname(req.url.split('?')[0])) {
      req.url = '/app/index.html';
    }
    next();
  };
  return {
    name: 'app-spa-fallback',
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

export default defineConfig({
  plugins: [react(), appSpaFallback()],
  build: {
    rollupOptions: {
      input: {
        // "/"     -> portfolio (static landing page, untouched design)
        // "/app/" -> React app (Login + Dashboard)
        main: path.resolve(__dirname, 'index.html'),
        app: path.resolve(__dirname, 'app/index.html'),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
