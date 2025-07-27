import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    base: '/modern-signature-plugin',
    plugins: [react(), tailwindcss()],
    build: {
        outDir: 'docs',     
    }
});
