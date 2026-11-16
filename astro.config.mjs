// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://laats-pty.github.io',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    // La CSP no permite scripts en línea ('unsafe-inline'): todo script
    // procesado debe salir como archivo aparte en /_astro/.
    build: { assetsInlineLimit: 0 }
  }
});
