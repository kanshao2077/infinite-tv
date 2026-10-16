import { defineConfig } from 'vite';

// Keep a production build portable when hosted below a repository or project path.
export default defineConfig({ base: './' });
