import { funcd } from '@funcd-dev/vite-plugin';
import { defineConfig } from 'vite';

// Bundles the Job's handler into one self-contained .mjs beside its contract file (funcd ADR-0144, ADR-0247).
export default defineConfig({
  plugins: [funcd({ functions: { report: 'src/main.ts' }, outDir: '.' })],
});
