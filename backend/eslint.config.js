import globals from "globals";
import pluginJs from "@eslint/js";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: "latest", // Use latest ECMAScript version
      sourceType: "module",
    },
    rules: {
      "no-console": "off",
      // Add other rules as needed
    },
  },
  pluginJs.configs.recommended,
  prettierConfig,
];