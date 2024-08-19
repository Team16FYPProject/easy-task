import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        environment: "jsdom",
        include: ["./src/**/*.test.{js,ts,jsx,tsx}"],
        exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "./src/**/*.{spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
        ],
    },
});
