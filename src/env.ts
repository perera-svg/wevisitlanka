import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const processEnv = typeof process === "undefined" ? {} : process.env;
const viteRuntimeEnv =
	(import.meta as ImportMeta & { env?: Record<string, string | undefined> })
		.env ?? {};

export const env = createEnv({
	server: {
		SERVER_URL: z.string().url().optional(),
		SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
		WORKOS_API_KEY: z.string().min(1),
	},

	/**
	 * The prefix that client-side variables must have. This is enforced both at
	 * a type-level and at runtime.
	 */
	clientPrefix: "VITE_",

	client: {
		VITE_SENTRY_DSN: z.string().url(),
		VITE_SENTRY_ORG: z.string().min(1),
		VITE_SENTRY_PROJECT: z.string().min(1),
		VITE_WORKOS_CLIENT_ID: z.string().min(1),
		VITE_WORKOS_API_HOSTNAME: z.string().min(1),
		VITE_ENVIRONMENT: z.string().min(1).optional(),
		VITE_APP_TITLE: z.string().min(1).optional(),
	},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnvStrict: {
		SERVER_URL: processEnv.SERVER_URL,
		SENTRY_AUTH_TOKEN: processEnv.SENTRY_AUTH_TOKEN,
		WORKOS_API_KEY: processEnv.WORKOS_API_KEY,
		VITE_SENTRY_DSN:
			viteRuntimeEnv.VITE_SENTRY_DSN ?? processEnv.VITE_SENTRY_DSN,
		VITE_SENTRY_ORG:
			viteRuntimeEnv.VITE_SENTRY_ORG ?? processEnv.VITE_SENTRY_ORG,
		VITE_SENTRY_PROJECT:
			viteRuntimeEnv.VITE_SENTRY_PROJECT ?? processEnv.VITE_SENTRY_PROJECT,
		VITE_WORKOS_CLIENT_ID:
			viteRuntimeEnv.VITE_WORKOS_CLIENT_ID ?? processEnv.VITE_WORKOS_CLIENT_ID,
		VITE_WORKOS_API_HOSTNAME:
			viteRuntimeEnv.VITE_WORKOS_API_HOSTNAME ??
			processEnv.VITE_WORKOS_API_HOSTNAME,
		VITE_ENVIRONMENT:
			viteRuntimeEnv.VITE_ENVIRONMENT ?? processEnv.VITE_ENVIRONMENT,
		VITE_APP_TITLE: viteRuntimeEnv.VITE_APP_TITLE ?? processEnv.VITE_APP_TITLE,
	},

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,
});
