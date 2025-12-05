import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: cast process to any to avoid TypeScript error about 'cwd' missing on type 'Process'
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Replace process.env.API_KEY with the actual value during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Ensure NODE_ENV is available for libraries
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});