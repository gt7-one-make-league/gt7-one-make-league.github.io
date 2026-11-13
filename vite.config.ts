import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";
import type {Plugin} from "vite";
import {checkAllData} from "./src/data/validate.ts";

// Fails the build, and reports at dev server start, when the data files are inconsistent
function dataCheck(): Plugin {
	return {
		name: "data-check",
		buildStart() {
			const problems = checkAllData();
			if (problems.length > 0) {
				this.error(`Data check failed:\n${problems.map((problem) => `  - ${problem}`).join("\n")}`);
			}
		},
	};
}

// https://vite.dev/config/
// The site is the org's root GitHub Pages site, so the default base of "/" is correct.
export default defineConfig({
	plugins: [dataCheck(), react()],
	build: {
		target: "es2022",
	},
});
