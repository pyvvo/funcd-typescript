import { funcd } from '@funcd-dev/vite-plugin';
import { defineConfig } from 'vite';

// Bundles each function into one self-contained .mjs beside its contract file (funcd ADR-0144, ADR-0247).
export default defineConfig({
  plugins: [
    funcd({
      functions: {
        ingest: 'src/ingest/main.ts',
        score: 'src/score/main.ts',
        hi: 'src/hi/main.ts',
        lo: 'src/lo/main.ts',
        report: 'src/report/main.ts',
      },
      outDir: '.',
    }),
  ],
});
