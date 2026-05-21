// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://laats-pty.github.io',
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  }
});
