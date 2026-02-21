Welcome to your new TanStack Start app! 

# Getting Started

To run this application:

```bash
bun install
bun --bun run dev
```

# Building For Production

To build this application for production:

```bash
bun --bun run build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
bun --bun run test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Remove the demo pages in `src/routes/demo/`
2. Replace the Tailwind import in `src/styles.css` with your own styles
3. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
4. Uninstall the packages: `bun install @tailwindcss/vite tailwindcss -D`

## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The following scripts are available:

```bash
bun --bun run lint
bun --bun run format
bun --bun run check
```

> **Note:** Every pull request and push to `main` must pass the Biome lint stage in CI. Run `bun --bun run check` locally before opening a PR to catch any issues early.
## Git Workflow: Pre-commit Biome Check

This project runs `biome check` on staged files during `git commit` using Husky + lint-staged.

If a commit is blocked, fix it with this flow:

```bash
# 1) See all current issues in the repo
bun --bun run check

# 2) Apply formatting fixes
bun --bun run format --write

# 3) Stage fixes and commit again
git add -A
git commit
```

If issues still remain after formatting, update the reported files manually, then run `bun run check` again and commit.


## Setting up WorkOS

To enable authentication and other features powered by WorkOS, you’ll need to configure a few environment variables and set up a project in the WorkOS dashboard.

1. **Create / configure a WorkOS project**
   - Go to the [WorkOS Dashboard](https://dashboard.workos.com/) and create a new project (or select an existing one).
   - In your project, locate the **Client ID** (often under “Configuration” or “API Keys”).
   - If your app uses the WorkOS API directly, also locate your **API Key** and, if applicable, any **Webhook Secret** values.

2. **Set environment variables**
   Create (or update) a `.env.local` file in the root of the project and add:

   ```bash
   # Public client identifier used by the frontend
   VITE_WORKOS_CLIENT_ID=<your-workos-client-id>

   # If your app uses server-side WorkOS calls, you may also need:
   # WORKOS_API_KEY=<your-workos-api-key>
   # WORKOS_WEBHOOK_SECRET=<your-workos-webhook-secret>
   ```

3. **Configure redirect URLs**
   - In the WorkOS Dashboard, configure the OAuth / Redirect URLs to point to your application’s callback route (for example, `http://localhost:3000/callback` in development).
   - Make sure this value matches whatever redirect URL is used in your application’s WorkOS integration.


## Setting up Sentry

This project includes Sentry for error monitoring. To enable it in your environment:

1. Create a Sentry account and a new project at [sentry.io](https://sentry.io/).
2. In the Sentry project settings, find your **DSN**, **Organization Slug**, and **Project Slug**. You will also need an **Auth Token** with permissions suitable for source maps/releases (for example, project:releases and org:read).
3. Add the following environment variables to your `.env.local`:

   ```bash
   # Sentry connection string (required)
   VITE_SENTRY_DSN=<your-sentry-dsn>

   # Sentry organization and project used by the Vite/Sentry integration (required)
   VITE_SENTRY_ORG=<your-sentry-org-slug>
   VITE_SENTRY_PROJECT=<your-sentry-project-slug>

   # Auth token used for Sentry CLI / build-time operations (required)
   SENTRY_AUTH_TOKEN=<your-sentry-auth-token>
   # Optional: environment name used to tag events (e.g. development, staging, production)
   VITE_ENVIRONMENT=development
   ```

Once these variables are set, Sentry will start capturing errors and performance data according to the project’s Sentry configuration.
## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
})
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({
  method: 'GET',
}).handler(async () => {
  return new Date().toISOString()
})

// Use in a component
function MyComponent() {
  const [time, setTime] = useState('')
  
  useEffect(() => {
    getServerTime().then(setTime)
  }, [])
  
  return <div>Server time: {time}</div>
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' }),
    },
  },
})
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json()
  },
  component: PeopleComponent,
})

function PeopleComponent() {
  const data = Route.useLoaderData()
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  )
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
