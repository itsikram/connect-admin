import next from "eslint-config-next";

export default [
  ...next(),
  {
    // Keep a small set of extra rules if desired
    rules: {
      // Next.js specific
      "@next/next/no-img-element": "warn",
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];
