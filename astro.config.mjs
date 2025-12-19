// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://gearedup-production.up.railway.app',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/embed/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    port: 4488,
  },
  build: {
    format: 'directory',
  },
});
