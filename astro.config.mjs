import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://techsafe.ai',
  output: 'static',
  adapter: node({
    mode: 'standalone'
  }),
  trailingSlash: 'never',
  build: {
    format: 'directory'
  }
});
