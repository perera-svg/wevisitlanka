import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { createClientOnlyFn } from "@tanstack/react-start";
import { routeTree } from "./routeTree.gen";

const sentryDsn =
  import.meta.env?.VITE_SENTRY_DSN ?? process.env.VITE_SENTRY_DSN;

const initSentryClient = createClientOnlyFn(async () => {
  if (!sentryDsn) {
    console.warn(
      "VITE_SENTRY_DSN is not defined. Sentry is not running on client.",
    );
    return;
  }

  const Sentry = await import("@sentry/tanstackstart-react");
  Sentry.init({
    dsn: sentryDsn,
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
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
