import { funcd } from '@funcd-dev/vite-plugin';
import { defineConfig } from 'vite';

// Bundles each function into one self-contained .mjs beside its contract file (funcd ADR-0144, ADR-0247).
export default defineConfig({
  plugins: [funcd({ functions: { 'hello-world': 'src/main.ts' }, outDir: '.' })],
});
