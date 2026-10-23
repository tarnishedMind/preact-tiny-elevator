import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
    plugins: [preact()],
    server: {
        proxy: {
            // The people server (npm run server); same origin, so the client needs no URL config.
            '/ws': { target: 'ws://localhost:3001', ws: true },
        },
    },
});
