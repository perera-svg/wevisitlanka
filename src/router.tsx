import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import { env } from "@/env";
import { routeTree } from "./routeTree.gen";

const sentryEnvironment = env.VITE_ENVIRONMENT ?? "development";

const initSentryClient = createClientOnlyFn(async () => {
	const Sentry = await import("@sentry/tanstackstart-react");
	Sentry.init({
		dsn: env.VITE_SENTRY_DSN,
		// Adds request headers and IP for users, for more info visit:
		// https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
		sendDefaultPii: true,
		tracesSampleRate: 1.0,
		replaysSessionSampleRate: 1.0,
		replaysOnErrorSampleRate: 1.0,
		environment: sentryEnvironment,
	});
});

export function getRouter() {
	const router = createTanStackRouter({
		routeTree,

		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
	});

	if (!router.isServer) {
		initSentryClient();
	}

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
