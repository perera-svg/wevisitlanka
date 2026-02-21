import { defineConfig } from "vite";
import { sentryTanstackStart } from "@sentry/tanstackstart-react";
import { devtools } from "@tanstack/devtools-vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const project =
  import.meta.env?.VITE_SENTRY_PROJECT ?? process.env.VITE_SENTRY_PROJECT;
if (!project) {
  throw new Error(
    "VITE_SENTRY_PROJECT is not defined. Please set it in your .env file.",
  );
}

const sentryOrg =
  import.meta.env?.VITE_SENTRY_ORG ?? process.env.VITE_SENTRY_ORG;
if (!sentryOrg) {
  throw new Error(
    "VITE_SENTRY_ORG is not defined. Please set it in your .env file.",
  );
}

const sentryAuthToken =
  import.meta.env?.SENTRY_AUTH_TOKEN ?? process.env.SENTRY_AUTH_TOKEN;

if (!sentryAuthToken) {
  throw new Error(
    "SENTRY_AUTH_TOKEN is not defined. Please set it in your .env file.",
  );
}

const config = defineConfig({
  plugins: [
    devtools(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    // other plugins - sentryTanstackStart should be last
    sentryTanstackStart({
      org: sentryOrg,
      project: project,
      authToken: sentryAuthToken,
    }),
  ],
});

export default config;
