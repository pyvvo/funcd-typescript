import { funcd } from '@funcd-dev/vite-plugin';
import { defineConfig } from 'vite';

// Bundles each function into one self-contained .mjs beside its funcdctl.yaml (funcd ADR-0144).
export default defineConfig({
  plugins: [
    funcd({
      functions: { greeter: 'src/greeter.ts', front: 'src/front.ts', hold: 'src/hold.ts', fanout: 'src/fanout.ts' },
      outDir: '.',
    }),
  ],
});
