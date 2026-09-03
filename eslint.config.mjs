import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      
      "react-hooks/exhaustive-deps": "off",
      
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/refs": "off",
      
      "@typescript-eslint/no-unused-vars": "warn",
      
    },
  },
]);

export default eslintConfig;
