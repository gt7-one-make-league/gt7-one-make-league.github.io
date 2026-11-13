import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import {defineConfig, globalIgnores} from "eslint/config";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
	globalIgnores(["dist"]),
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			react.configs.flat.recommended,
			react.configs.flat["jsx-runtime"],
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2022,
			globals: globals.browser,
		},
		plugins: {
			"@stylistic": stylistic,
		},
		settings: {
			react: {
				version: "detect",
			},
		},
		rules: {
			// Project code rules
			"curly": ["error", "all"],
			"no-restricted-properties": [
				"error",
				{property: "forEach", message: "Use for...of instead of forEach."},
				{property: "innerHTML", message: "Build elements instead of assigning HTML strings."},
			],
			"react/no-danger": "error",

			"no-console": ["error", {allow: ["error"]}],
			"@typescript-eslint/consistent-type-imports": "error",
			"@stylistic/linebreak-style": ["error", "unix"],
			"@stylistic/brace-style": ["error", "1tbs"],
			"@stylistic/indent": ["error", "tab", {SwitchCase: 1}],
			"@stylistic/no-trailing-spaces": "error",
			"@stylistic/no-multi-spaces": "error",
			"@stylistic/no-tabs": ["error", {allowIndentationTabs: true}],
			"@stylistic/no-multiple-empty-lines": ["error", {max: 2, maxBOF: 1, maxEOF: 1}],
			"@stylistic/no-whitespace-before-property": "error",
			"@stylistic/keyword-spacing": ["error", {before: true, after: true}],
			"@stylistic/switch-colon-spacing": ["error", {before: false, after: true}],
			"@stylistic/space-infix-ops": "error",
			"@stylistic/key-spacing": ["error", {beforeColon: false, afterColon: true}],
			"@stylistic/block-spacing": "error",
			"@stylistic/space-before-function-paren": ["error", "never"],
			"@stylistic/space-unary-ops": ["error", {words: true, nonwords: false}],
			"@stylistic/space-before-blocks": "error",
			"@stylistic/function-call-spacing": ["error", "never"],
			"@stylistic/array-bracket-spacing": ["error", "never"],
			"@stylistic/object-curly-spacing": ["error", "never"],
			"@stylistic/space-in-parens": ["error", "never"],
			"@stylistic/comma-spacing": ["error", {before: false, after: true}],
			"@stylistic/arrow-spacing": ["error", {before: true, after: true}],
			"@stylistic/rest-spread-spacing": ["error", "never"],
			"@stylistic/semi": ["error", "always"],
			"@stylistic/quotes": ["error", "double", {avoidEscape: true}],
		},
	},
);
