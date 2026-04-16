import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host',
      remotes: {
        remote_auth: 'http://localhost:3001/assets/remoteEntry.js',
        remote_community: 'http://localhost:3002/assets/remoteEntry.js',
        remote_events: 'http://localhost:3003/assets/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.26.0' },
        '@apollo/client': { singleton: true, requiredVersion: '^3.11.0' },
        graphql: { singleton: true, requiredVersion: '^16.9.0' },
      },
    }),
  ],
  server: {
    port: 3000,
    strictPort: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  preview: {
    port: 3000,
    strictPort: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  build: {
    emptyOutDir: true,
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
