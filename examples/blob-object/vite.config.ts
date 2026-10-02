import { funcd } from '@funcd-dev/vite-plugin';
import { defineConfig } from 'vite';

// Bundles each function into one self-contained .mjs beside its funcdctl.yaml (funcd ADR-0144).
export default defineConfig({
  plugins: [funcd({ functions: { object: 'src/object.ts' }, outDir: '.' })],
});
