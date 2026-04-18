import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'remote_auth',
      filename: 'remoteEntry.js',
      exposes: {
        './HomePage':     './src/pages/HomePage',
        './LoginPage':    './src/pages/LoginPage',
        './RegisterPage': './src/pages/RegisterPage',
        './ProfilePage': './src/pages/ProfilePage',
      },
      shared: {
        react:            { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom':      { singleton: true, requiredVersion: '^18.3.1' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.26.0' },
        '@apollo/client': { singleton: true, requiredVersion: '^3.11.0' },
        graphql:          { singleton: true, requiredVersion: '^16.9.0' },
      },
    }),
  ],
  build: {
    emptyOutDir: true,
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server:  { port: 3001, strictPort: true, headers: { 'Access-Control-Allow-Origin': '*' } },
  preview: { port: 3001, strictPort: true, headers: { 'Access-Control-Allow-Origin': '*' } },
});
