import { cloudflare } from "@cloudflare/vite-plugin";
import { sentryTanstackStart } from "@sentry/tanstackstart-react";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { env } from "./src/env";

const config = defineConfig({
	plugins: [
		...(process.env.CI ? [] : [devtools()]),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		// other plugins - sentryTanstackStart should be last
		sentryTanstackStart({
			org: env.VITE_SENTRY_ORG,
			project: env.VITE_SENTRY_PROJECT,
			authToken: env.SENTRY_AUTH_TOKEN,
		}),
	],
});

export default config;
