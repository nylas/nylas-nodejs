import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig({
  plugins: [
    cloudflare({
      // Enable Node.js compatibility for full Node.js API support
      configPath: './wrangler.toml',
    }),
  ],
});
