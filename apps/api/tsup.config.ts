import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  splitting: false,
  noExternal: ['@nexo/contracts'],
  external: [
    'express',
    'mongoose',
    'jose',
    'bcryptjs',
    'helmet',
    'cors',
    'cookie-parser',
    'express-rate-limit',
    'pino',
    'dotenv',
    'zod',
  ],
});
