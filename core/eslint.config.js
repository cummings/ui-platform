import platform from "@core/config/eslint";

export default [
  { ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**", "packages/create-app/template/**"] },
  ...platform,
];
