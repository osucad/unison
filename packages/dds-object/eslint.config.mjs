import baseConfig from "../../eslint.config.mjs";

export default [
  ...baseConfig,
  {
    "files": [
      "**/*.json"
    ],
    "rules": {
      "@nx/dependency-checks": [
        "error",
        {
          "ignoredFiles": [
            "{projectRoot}/eslint.config.{js,cjs,mjs}",
            "{projectRoot}/vite.config.{js,ts,mjs,mts}"
          ],
          "ignoredDependencies": ["@unison/client-test-utils"]
        }
      ]
    },
    "languageOptions": {
      "parser": (await import("jsonc-eslint-parser"))
    }
  }
];
