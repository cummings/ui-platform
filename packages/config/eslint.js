import tseslint from "typescript-eslint";

/** Platform-wide lint baseline. Apps spread this into their own flat config. */
export default tseslint.config(...tseslint.configs.recommended, {
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "@typescript-eslint/consistent-type-imports": "error",
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@core/*/src/*", "@core/*/dist/*"],
            message: "Import @core packages through their public entry points only.",
          },
        ],
      },
    ],
  },
});
