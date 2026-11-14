import { funcd } from '@funcd-dev/vite-plugin';
import { defineConfig } from 'vite';

// Bundles each function into one self-contained .mjs beside its contract file.
export default defineConfig({
  plugins: [
    funcd({
      functions: {
        'token-owner': 'src/token-owner/main.ts',
        'token-user': 'src/token-user/main.ts',
      },
      outDir: '.',
    }),
  ],
});
