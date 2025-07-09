import baseConfig from "@emul8/eslint-config/base";
import reactConfig from "@emul8/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  ...reactConfig,
];