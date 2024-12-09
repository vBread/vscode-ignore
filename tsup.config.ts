import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/extension.ts"],
	format: "cjs",
	clean: true,
	external: ["vscode"],
	noExternal: ["@octokit/request", "fast-glob"],
	minify: true,
});
