// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  /* Canonical production URL. Used to generate sitemap.xml, canonical
     links and absolute OG/social URLs. Must match the live domain. */
  site: 'https://testsandfunnels.com',

  /* Preserve the current site's URL scheme: every route builds to
     <path>/index.html (e.g. /services/ -> services/index.html) with a
     trailing slash, so existing links, SEO and the Hostinger .htaccess
     clean-URL rules keep working unchanged. */
  trailingSlash: 'always',
  build: { format: 'directory' },

  /* Tailwind v4 runs as a Vite plugin (CSS-first config, no tailwind.config.js). */
  vite: { plugins: [tailwindcss()] },

  /* react(): enables React islands (shadcn/ui, Framer Motion).
     sitemap(): auto-generates sitemap.xml at build time. */
  integrations: [react(), sitemap()],
});
