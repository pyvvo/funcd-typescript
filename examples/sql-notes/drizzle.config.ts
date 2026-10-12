import { defineConfig } from 'drizzle-kit';

// npm run generate writes a new migration into drizzle/ for each change to the schema.
export default defineConfig({ dialect: 'sqlite', schema: 'src/db/schema.ts', out: 'drizzle' });
