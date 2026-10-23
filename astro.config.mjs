import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://al-writer.github.io',
  trailingSlash: 'always',
  integrations: [sitemap()],
  prefetch: { prefetchAll: true },
  markdown: { smartypants: true },
});
