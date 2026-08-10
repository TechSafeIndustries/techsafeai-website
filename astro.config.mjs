import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://techsafe.ai',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'directory'
  }
});
