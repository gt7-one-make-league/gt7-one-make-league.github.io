import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

// https://vite.dev/config/
// The site is the org's root GitHub Pages site, so the default base of "/" is correct.
export default defineConfig({
	plugins: [react()],
	build: {
		target: "es2022",
	},
});
