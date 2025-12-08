import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    define: {
        'import.meta.env.VITE_API_URL2': JSON.stringify(
            'https://symmetrical-guide-v7q4g66jw54f6qpq-3000.app.github.dev/',
        ),
        'import.meta.env.PRODUCTION': JSON.stringify(false),
        'import.meta.env.VITE_USE_DB': JSON.stringify(false),
    },
});