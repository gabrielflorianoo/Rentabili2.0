import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    define: {
        'import.meta.env.VITE_API_URL': JSON.stringify(
            'https://fictional-fiesta-6746r99xp9x34r5r-3000.app.github.dev/',
        ),
        'import.meta.env.PRODUCTION': JSON.stringify(false),
        'import.meta.env.VITE_USE_DB': JSON.stringify(false),
    },
});