import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    // Web3Auth and its dependencies use Node.js globals (Buffer, process, global)
    // in browser bundles — this plugin stubs them safely.
    nodePolyfills({
      globals: { Buffer: true, global: true, process: true },
      protocolImports: false,
    }),
  ],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    modulePreload: {
      resolveDependencies: (_filename, deps) =>
        deps.filter((dep) => !dep.includes('vendor-web3auth')),
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split Web3Auth into its own chunk — ~400 KiB, lazy-loaded only for
          // social login users. MiniPay users never trigger the dynamic import.
          if (
            id.includes('node_modules/@web3auth') ||
            id.includes('node_modules/@toruslabs')
          ) {
            return 'vendor-web3auth';
          }
        },
      },
    },
  },
  server: {
    allowedHosts: true,
    // The dev server is usually reached through an ngrok tunnel (MiniPay only
    // runs on a phone), and on that phone "localhost" is the phone itself. So
    // dev builds call /api on their own origin and Vite forwards it to the API
    // server here. Override the target to test against the deployed backend:
    //   API_PROXY_TARGET=https://nukko.onrender.com npm run dev
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
