import * as Sentry from "@sentry/tanstackstart-react";

const sentryDsn =
  import.meta.env?.VITE_SENTRY_DSN ?? process.env.VITE_SENTRY_DSN;
const sentryEnvironment =
  import.meta.env?.VITE_ENVIRONMENT ??
  process.env.VITE_ENVIRONMENT ??
  "development";

if (!sentryDsn) {
  console.warn("VITE_SENTRY_DSN is not defined. Sentry is not running.");
} else {
  const isProduction = sentryEnvironment === "production";

  Sentry.init({
    dsn: sentryDsn,
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
    // Use lower sample rates in production to control data volume and cost.
    tracesSampleRate: isProduction ? 0.2 : 1.0,
    replaysSessionSampleRate: isProduction ? 0.1 : 1.0,
    // Keep full sampling for error replays as recommended.
    replaysOnErrorSampleRate: 1.0,
    environment: sentryEnvironment,
  });
}
