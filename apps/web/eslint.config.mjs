import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

// A slice is entered through its index.ts; shared is entered per module —
// `shared/routes.ts`, `shared/ui/button.tsx`, `shared/lib/realtime/index.ts`.
const sliceEntry = (types) => ({ element: { type: types, fileInternalPath: "index.ts" } });
const sharedEntry = {
	element: { type: "shared", fileInternalPath: ["*", "*/*", "*/*/index.ts"] },
};
// Slices in one layer stay apart at runtime, but may share TypeScript types.
const sameLayerTypes = (layer) => ({
	from: { element: { type: layer } },
	allow: { to: sliceEntry([layer]), dependency: { kind: "type" } },
});

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		".next/**",
		"out/**",
		"build/**",
		"next-env.d.ts",
	]),
	{
		files: ["src/**/*.{ts,tsx}"],
		plugins: { boundaries },
		settings: {
			"import/resolver": { typescript: {} },
			"boundaries/elements": [
				{ type: "app", pattern: "src/app" },
				{ type: "widgets", pattern: "src/widgets/*", capture: ["slice"] },
				{ type: "features", pattern: "src/features/*", capture: ["slice"] },
				{ type: "entities", pattern: "src/entities/*", capture: ["slice"] },
				{ type: "shared", pattern: "src/shared" },
			],
		},
		rules: {
			"boundaries/dependencies": [
				"error",
				{
					default: "disallow",
					// Layers top-down; each may import only from the ones below it.
					policies: [
						{
							from: { element: { type: "app" } },
							allow: { to: [sliceEntry(["widgets", "features", "entities"]), sharedEntry] },
						},
						{
							from: { element: { type: "widgets" } },
							allow: { to: [sliceEntry(["features", "entities"]), sharedEntry] },
						},
						{
							from: { element: { type: "features" } },
							allow: { to: [sliceEntry(["entities"]), sharedEntry] },
						},
						{
							from: { element: { type: "entities" } },
							allow: { to: [sharedEntry] },
						},
						{
							from: { element: { type: "shared" } },
							allow: { to: [sharedEntry] },
						},
						...["widgets", "features", "entities"].map(sameLayerTypes),
					],
				},
			],
		},
	},
]);

export default eslintConfig;
