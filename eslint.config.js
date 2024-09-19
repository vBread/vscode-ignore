import config from "@antfu/eslint-config";
import prettier from "eslint-config-prettier";

export default config({
	stylistic: false,
	rules: {
		curly: "off",
		"no-console": "off",
		"import/order": "off",
		"jsonc/sort-keys": "off",
		"ts/ban-ts-comment": "off",
		"ts/prefer-ts-expect-error": "off",
		"perfectionist/sort-imports": [
			"error",
			{
				newlinesBetween: "ignore",
				groups: [
					["side-effect", "side-effect-style"],
					["builtin", "external"],
					["internal", "internal-type"],
					["parent", "parent-type", "sibling", "sibling-type", "index", "index-type"],
					["object", "unknown"],
				],
			},
		],
	},
}).append(prettier);
