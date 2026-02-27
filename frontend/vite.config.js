/**
 * Vite Configuration
 * 
 * Configuration for React + Electron development
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],

    // Root directory for the frontend
    root: 'src/renderer',

    // Public directory
    publicDir: '../../public',

    // Build configuration
    build: {
        outDir: '../../dist',
        emptyOutDir: true,
        sourcemap: true
    },

    // Resolve configuration
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src/renderer/src')
        }
    },

    // Development server
    server: {
        port: 5173,
        strictPort: true,
        host: true
    },

    // Environment variables prefix
    envPrefix: 'VITE_'
});
