# Register Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a custom register page with email/password + social login (Google, GitHub, Apple), replacing WorkOS hosted auth with a custom UI using shadcn components.

**Architecture:** Split-panel layout matching the .pen design — form on left, hero image on right. TanStack Form + Zod for client-side validation. WorkOS Node SDK server functions for user creation and OAuth URL generation via `createServerFn`. Existing `AuthKitProvider` + `useAuth()` remain the auth state source.

**Tech Stack:** TanStack Start, TanStack Form, Zod, WorkOS Node SDK (`@workos-inc/node`), shadcn/ui (Button, Input, Label, Separator, Field), Tailwind CSS v4, Lucide React icons.

**Design Reference:** `design/tourisum.pen` > node `bnvu5` (Register Page), node `uYHcJ` (Login Page for pattern consistency).

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install TanStack Form and WorkOS Node SDK**

Run:
```bash
bun add @tanstack/react-form @workos-inc/node
```

**Step 2: Verify installation**

Run:
```bash
bun install
```
Expected: No errors. Both packages appear in `package.json` dependencies.

**Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add @tanstack/react-form and @workos-inc/node dependencies"
```

---

## Task 2: Add WORKOS_API_KEY Environment Variable

**Files:**
- Modify: `src/env.ts`
- Modify: `.env.local`

**Step 1: Add WORKOS_API_KEY to T3Env server schema**

In `src/env.ts`, add to the `server` object:

```typescript
server: {
  SERVER_URL: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
  WORKOS_API_KEY: z.string().min(1),  // <-- ADD THIS
},
```

And add to `runtimeEnvStrict`:

```typescript
WORKOS_API_KEY: processEnv.WORKOS_API_KEY,
```

**Step 2: Add the key to `.env.local`**

```
WORKOS_API_KEY=sk_test_your_key_here
```

> **Note:** Get the actual API key from the WorkOS dashboard > API Keys.

**Step 3: Verify the app still starts**

Run:
```bash
bun run dev
```
Expected: App starts without Zod validation errors. If it fails, the `WORKOS_API_KEY` value in `.env.local` is missing or empty.

**Step 4: Commit**

```bash
git add src/env.ts
git commit -m "feat(auth): add WORKOS_API_KEY server env variable"
```

> Do NOT commit `.env.local`.

---

## Task 3: Create Password Strength Bar Component

**Files:**
- Create: `src/components/register/password-strength-bar.tsx`

**Step 1: Create the component**

This is a visual-only component showing 4 colored segments based on password strength. Strength is computed from 4 criteria: length >= 8, has uppercase, has number, has special char.

```tsx
import { cn } from "@/lib/utils";

function computeStrength(password: string): number {
	let score = 0;
	if (password.length >= 8) score++;
	if (/[A-Z]/.test(password)) score++;
	if (/[0-9]/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;
	return score;
}

const strengthColors = [
	"bg-destructive",
	"bg-orange-500",
	"bg-yellow-500",
	"bg-green-500",
];

function strengthLabel(score: number): string {
	if (score === 0) return "";
	if (score === 1) return "Weak";
	if (score === 2) return "Fair";
	if (score === 3) return "Good";
	return "Strong";
}

export function PasswordStrengthBar({ password }: { password: string }) {
	const score = computeStrength(password);

	if (!password) return null;

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex gap-1">
				{Array.from({ length: 4 }).map((_, i) => (
					<div
						key={i}
						className={cn(
							"h-1 flex-1 rounded-full transition-colors",
							i < score ? strengthColors[score - 1] : "bg-border",
						)}
					/>
				))}
			</div>
			<p className="text-muted-foreground text-xs">{strengthLabel(score)}</p>
		</div>
	);
}
```

**Step 2: Verify no lint errors**

Run:
```bash
bun run check
```
Expected: No errors in the new file.

**Step 3: Commit**

```bash
git add src/components/register/password-strength-bar.tsx
git commit -m "feat(auth): add password strength bar component"
```

---

## Task 4: Create Social Login Buttons Component

**Files:**
- Create: `src/components/register/social-login-buttons.tsx`

**Step 1: Create the component**

Uses shadcn Button with `variant="outline"` and inline SVG icons for each provider. Each button calls a callback with the provider name.

```tsx
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Provider = "GoogleOAuth" | "GitHubOAuth" | "AppleOAuth";

interface SocialLoginButtonsProps {
	onProviderClick: (provider: Provider) => void;
	disabled?: boolean;
}

function GoogleIcon() {
	return (
		<svg viewBox="0 0 24 24" className="size-4">
			<path
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
				fill="#4285F4"
			/>
			<path
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				fill="#34A853"
			/>
			<path
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				fill="#FBBC05"
			/>
			<path
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				fill="#EA4335"
			/>
		</svg>
	);
}

function GitHubIcon() {
	return (
		<svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
			<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
		</svg>
	);
}

function AppleIcon() {
	return (
		<svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
			<path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
		</svg>
	);
}

export function SocialLoginButtons({
	onProviderClick,
	disabled,
}: SocialLoginButtonsProps) {
	return (
		<div className="flex flex-col gap-3">
			<div className="relative flex items-center gap-3">
				<Separator className="flex-1" />
				<span className="text-muted-foreground text-xs">or</span>
				<Separator className="flex-1" />
			</div>
			<Button
				variant="outline"
				size="lg"
				className="w-full gap-2"
				disabled={disabled}
				onClick={() => onProviderClick("GoogleOAuth")}
			>
				<GoogleIcon />
				Continue with Google
			</Button>
			<Button
				variant="outline"
				size="lg"
				className="w-full gap-2"
				disabled={disabled}
				onClick={() => onProviderClick("GitHubOAuth")}
			>
				<GitHubIcon />
				Continue with GitHub
			</Button>
			<Button
				variant="outline"
				size="lg"
				className="w-full gap-2"
				disabled={disabled}
				onClick={() => onProviderClick("AppleOAuth")}
			>
				<AppleIcon />
				Continue with Apple
			</Button>
		</div>
	);
}

export type { Provider };
```

**Step 2: Verify no lint errors**

Run:
```bash
bun run check
```
Expected: No errors.

**Step 3: Commit**

```bash
git add src/components/register/social-login-buttons.tsx
git commit -m "feat(auth): add social login buttons component"
```

---

## Task 5: Create Register Hero Component

**Files:**
- Create: `src/components/register/register-hero.tsx`

**Step 1: Create the right-panel hero component**

Matches the .pen design: beach background image, testimonial overlay at bottom.

```tsx
export function RegisterHero() {
	return (
		<div
			className="relative hidden h-full w-[640px] shrink-0 bg-cover bg-center lg:flex lg:flex-col lg:justify-end"
			style={{
				backgroundImage:
					"url('https://images.unsplash.com/photo-1733937797040-3cd371a99892?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')",
			}}
		>
			<div className="m-12 rounded-lg bg-black/40 p-6 backdrop-blur-sm">
				<blockquote className="text-white">
					<p className="mb-4 leading-relaxed">
						&ldquo;The onboarding was so simple. Within a day I had my first
						listing live and inquiries coming in.&rdquo;
					</p>
					<footer>
						<p className="text-sm font-semibold">Priya Fernando</p>
						<p className="text-sm text-white/70">
							Surf Bay Lessons &middot; Experience Provider
						</p>
					</footer>
				</blockquote>
			</div>
		</div>
	);
}
```

**Step 2: Verify no lint errors**

Run:
```bash
bun run check
```
Expected: No errors.

**Step 3: Commit**

```bash
git add src/components/register/register-hero.tsx
git commit -m "feat(auth): add register hero panel component"
```

---

## Task 6: Create Server Functions

**Files:**
- Create: `src/routes/register.tsx` (partial — server functions only, route shell added here)

**Step 1: Create the route file with server functions**

The route file contains two `createServerFn` functions that use the WorkOS Node SDK. These run on the server only.

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import * as Sentry from "@sentry/tanstackstart-react";

const registerUser = createServerFn({ method: "POST" })
	.validator(
		(data: { email: string; password: string; firstName: string; lastName: string }) => data,
	)
	.handler(async ({ data }) => {
		const { WorkOS } = await import("@workos-inc/node");
		const { env } = await import("@/env");

		const workos = new WorkOS(env.WORKOS_API_KEY, {
			clientId: env.VITE_WORKOS_CLIENT_ID,
		});

		return Sentry.startSpan(
			{ name: "workos.createUser", op: "auth.register" },
			async () => {
				const user = await workos.userManagement.createUser({
					email: data.email,
					password: data.password,
					firstName: data.firstName,
					lastName: data.lastName,
				});

				// Auto-authenticate after creation
				const authResponse =
					await workos.userManagement.authenticateWithPassword({
						email: data.email,
						password: data.password,
						clientId: env.VITE_WORKOS_CLIENT_ID,
					});

				return {
					success: true as const,
					user,
					accessToken: authResponse.accessToken,
					refreshToken: authResponse.refreshToken,
				};
			},
		);
	});

const getOAuthUrl = createServerFn({ method: "GET" })
	.validator(
		(data: {
			provider: "GoogleOAuth" | "GitHubOAuth" | "AppleOAuth";
		}) => data,
	)
	.handler(async ({ data }) => {
		const { WorkOS } = await import("@workos-inc/node");
		const { env } = await import("@/env");

		const workos = new WorkOS(env.WORKOS_API_KEY, {
			clientId: env.VITE_WORKOS_CLIENT_ID,
		});

		const url = workos.userManagement.getAuthorizationUrl({
			provider: data.provider,
			redirectUri: `${env.SERVER_URL ?? "http://localhost:3000"}/callback`,
			clientId: env.VITE_WORKOS_CLIENT_ID,
		});

		return { url };
	});

export const Route = createFileRoute("/register")({
	ssr: false,
	component: RegisterPage,
});

function RegisterPage() {
	return <div>Register page placeholder</div>;
}

export { registerUser, getOAuthUrl };
```

> **Important:** The `WorkOS` import is dynamic (`await import(...)`) inside the handler to avoid bundling the Node SDK into the client bundle. The `env` import is also dynamic for the same reason.

**Step 2: Verify the dev server builds without errors**

Run:
```bash
bun run dev
```
Expected: Dev server starts. Navigating to `http://localhost:3000/register` shows "Register page placeholder".

**Step 3: Commit**

```bash
git add src/routes/register.tsx
git commit -m "feat(auth): add register route with WorkOS server functions"
```

---

## Task 7: Build the Register Form Component

**Files:**
- Create: `src/components/register/register-form.tsx`

**Step 1: Create the form component**

Uses TanStack Form with Zod validation. Composes shadcn Field, Input, Label, Button components without modifying them.

```tsx
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { PasswordStrengthBar } from "@/components/register/password-strength-bar";
import {
	SocialLoginButtons,
	type Provider,
} from "@/components/register/social-login-buttons";
import { registerUser, getOAuthUrl } from "@/routes/register";

const registerSchema = z
	.object({
		fullName: z.string().min(1, "Full name is required"),
		email: z.string().min(1, "Email is required").email("Invalid email address"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
		termsAccepted: z.literal(true, {
			errorMap: () => ({ message: "You must accept the terms" }),
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export function RegisterForm() {
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			fullName: "",
			email: "",
			password: "",
			confirmPassword: "",
			termsAccepted: false as boolean,
		},
		onSubmit: async ({ value }) => {
			setServerError(null);

			const parsed = registerSchema.safeParse(value);
			if (!parsed.success) return;

			try {
				const nameParts = value.fullName.trim().split(/\s+/);
				const firstName = nameParts[0] ?? "";
				const lastName = nameParts.slice(1).join(" ") || "";

				await registerUser({
					data: {
						email: value.email,
						password: value.password,
						firstName,
						lastName,
					},
				});

				navigate({ to: "/" });
			} catch (error) {
				setServerError(
					error instanceof Error
						? error.message
						: "Registration failed. Please try again.",
				);
			}
		},
	});

	const handleProviderClick = async (provider: Provider) => {
		try {
			const { url } = await getOAuthUrl({ data: { provider } });
			window.location.href = url;
		} catch (error) {
			setServerError(
				error instanceof Error
					? error.message
					: "Failed to start social login.",
			);
		}
	};

	return (
		<div className="flex w-full max-w-[400px] flex-col gap-7">
			{/* Logo */}
			<div className="flex items-center gap-2.5">
				<div className="flex size-10 items-center justify-center rounded-md bg-amber-500 font-bold text-white">
					SL
				</div>
				<div>
					<p className="text-sm font-bold">Sri Lanka Tourism</p>
					<p className="text-muted-foreground text-xs">Business Portal</p>
				</div>
			</div>

			{/* Header */}
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">Create your account</h1>
				<p className="text-muted-foreground text-sm">
					Register your business to start receiving bookings
				</p>
			</div>

			{/* Server Error */}
			{serverError && (
				<div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{serverError}
				</div>
			)}

			{/* Form */}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="flex flex-col gap-4"
			>
				{/* Full Name */}
				<form.Field
					name="fullName"
					validators={{
						onBlur: z.string().min(1, "Full name is required"),
					}}
				>
					{(field) => (
						<Field>
							<FieldLabel htmlFor="fullName">Full name</FieldLabel>
							<Input
								id="fullName"
								placeholder="Enter your full name"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={
									field.state.meta.isTouched &&
									field.state.meta.errors.length > 0
								}
							/>
							{field.state.meta.isTouched && (
								<FieldError errors={field.state.meta.errors} />
							)}
						</Field>
					)}
				</form.Field>

				{/* Business Email */}
				<form.Field
					name="email"
					validators={{
						onBlur: z
							.string()
							.min(1, "Email is required")
							.email("Invalid email address"),
					}}
				>
					{(field) => (
						<Field>
							<FieldLabel htmlFor="email">Business email</FieldLabel>
							<div className="relative">
								<Mail className="text-muted-foreground absolute left-2 top-1/2 size-3.5 -translate-y-1/2" />
								<Input
									id="email"
									type="email"
									placeholder="Enter your business email"
									className="pl-7"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={
										field.state.meta.isTouched &&
										field.state.meta.errors.length > 0
									}
								/>
							</div>
							{field.state.meta.isTouched && (
								<FieldError errors={field.state.meta.errors} />
							)}
						</Field>
					)}
				</form.Field>

				{/* Password */}
				<form.Field
					name="password"
					validators={{
						onBlur: z
							.string()
							.min(8, "Password must be at least 8 characters"),
					}}
				>
					{(field) => (
						<Field>
							<FieldLabel htmlFor="password">Password</FieldLabel>
							<Input
								id="password"
								type="password"
								placeholder="Create a password"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={
									field.state.meta.isTouched &&
									field.state.meta.errors.length > 0
								}
							/>
							<PasswordStrengthBar password={field.state.value} />
							{field.state.meta.isTouched && (
								<FieldError errors={field.state.meta.errors} />
							)}
						</Field>
					)}
				</form.Field>

				{/* Confirm Password */}
				<form.Field
					name="confirmPassword"
					validators={{
						onBlur: ({ value, fieldApi }) => {
							const password = fieldApi.form.getFieldValue("password");
							if (value !== password) return "Passwords do not match";
							return undefined;
						},
					}}
				>
					{(field) => (
						<Field>
							<FieldLabel htmlFor="confirmPassword">
								Confirm password
							</FieldLabel>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="Confirm your password"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								aria-invalid={
									field.state.meta.isTouched &&
									field.state.meta.errors.length > 0
								}
							/>
							{field.state.meta.isTouched && (
								<FieldError errors={field.state.meta.errors} />
							)}
						</Field>
					)}
				</form.Field>

				{/* Terms of Service */}
				<form.Field name="termsAccepted">
					{(field) => (
						<label className="flex items-start gap-2 text-xs">
							<input
								type="checkbox"
								checked={field.state.value}
								onChange={(e) => field.handleChange(e.target.checked)}
								className="mt-0.5 size-4 rounded border-border"
							/>
							<span className="text-muted-foreground">
								I agree to the{" "}
								<a href="/terms" className="text-primary underline">
									Terms of Service
								</a>{" "}
								and{" "}
								<a href="/privacy" className="text-primary underline">
									Privacy Policy
								</a>
							</span>
						</label>
					)}
				</form.Field>

				{/* Submit */}
				<form.Subscribe selector={(state) => state.isSubmitting}>
					{(isSubmitting) => (
						<Button
							type="submit"
							size="lg"
							className="w-full bg-amber-500 text-white hover:bg-amber-600"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Creating account..." : "Create Account"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			{/* Social Login */}
			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<SocialLoginButtons
						onProviderClick={handleProviderClick}
						disabled={isSubmitting}
					/>
				)}
			</form.Subscribe>

			{/* Login Link */}
			<p className="text-muted-foreground text-center text-xs">
				Already have an account?{" "}
				<a href="/login" className="font-medium text-teal-600">
					Sign in &rarr;
				</a>
			</p>
		</div>
	);
}
```

> **Key decisions:**
> - `form.Field` render props pattern from TanStack Form for each field
> - Zod validators on `onBlur` for individual fields
> - Full schema validation via `registerSchema.safeParse()` on submit
> - `FieldError` from shadcn `field.tsx` used as-is for error display
> - The `confirmPassword` validator uses `fieldApi.form.getFieldValue("password")` to cross-validate
> - Button color is `bg-amber-500` to match the .pen design's gold "Create Account" button
> - Mail icon from Lucide positioned absolutely inside the email input wrapper

**Step 2: Verify no lint errors**

Run:
```bash
bun run check
```
Expected: No errors.

**Step 3: Commit**

```bash
git add src/components/register/register-form.tsx
git commit -m "feat(auth): add register form with TanStack Form + Zod validation"
```

---

## Task 8: Assemble the Register Page

**Files:**
- Modify: `src/routes/register.tsx` (replace placeholder component)

**Step 1: Update the RegisterPage component**

Replace the placeholder `RegisterPage` function with the full split-panel layout:

```tsx
import { useAuth } from "@workos-inc/authkit-react";
import { RegisterForm } from "@/components/register/register-form";
import { RegisterHero } from "@/components/register/register-hero";

// ... (server functions stay as they are from Task 6) ...

function RegisterPage() {
	const { user, isLoading } = useAuth();
	const navigate = useNavigate();

	// Redirect if already authenticated
	if (!isLoading && user) {
		navigate({ to: "/" });
		return null;
	}

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-white">
			{/* Left Panel — Form */}
			<div className="flex flex-1 items-center justify-center px-8 py-12 lg:px-16">
				<RegisterForm />
			</div>

			{/* Right Panel — Hero Image */}
			<RegisterHero />
		</div>
	);
}
```

> **Important:** Add these imports at the top of the file alongside existing imports:
> - `import { useAuth } from "@workos-inc/authkit-react";`
> - `import { RegisterForm } from "@/components/register/register-form";`
> - `import { RegisterHero } from "@/components/register/register-hero";`

**Step 2: Verify the full page renders**

Run:
```bash
bun run dev
```
Navigate to `http://localhost:3000/register`. Expected: The split-panel register page matching the .pen design — form on left, beach image on right.

**Step 3: Verify no lint errors**

Run:
```bash
bun run check
```

**Step 4: Commit**

```bash
git add src/routes/register.tsx
git commit -m "feat(auth): assemble register page with split-panel layout"
```

---

## Task 9: Visual QA and Polish

**Files:**
- Possibly modify: `src/components/register/register-form.tsx`
- Possibly modify: `src/components/register/register-hero.tsx`

**Step 1: Compare with .pen design**

Open the dev server at `http://localhost:3000/register` and compare with the .pen design (`design/tourisum.pen` > Register Page node `bnvu5`). Check:

- [ ] Logo matches (gold "SL" box + text)
- [ ] Heading and subtitle text match
- [ ] Field labels and placeholders match
- [ ] Password strength bar shows 4 segments with correct colors
- [ ] "Create Account" button is gold/amber
- [ ] Social login buttons are below a divider
- [ ] "Already have an account? Sign in →" link is present
- [ ] Right panel shows beach image with testimonial overlay
- [ ] Right panel is hidden on mobile (below `lg` breakpoint)
- [ ] Form is vertically centered on left panel
- [ ] No visual glitches or overflow issues

**Step 2: Fix any discrepancies**

Adjust Tailwind classes as needed to match the design. Common fixes:
- Spacing (`gap-*`, `p-*`, `m-*`)
- Font sizes (`text-xs`, `text-sm`, `text-2xl`)
- Colors (`text-muted-foreground`, `bg-amber-500`)

**Step 3: Run full lint check**

Run:
```bash
bun run check
```

**Step 4: Commit**

```bash
git add -A
git commit -m "fix(auth): visual polish for register page to match design"
```

---

## Task 10: Write E2E Test for Register Page

**Files:**
- Create: `tests/register.spec.ts`

**Step 1: Write basic E2E test**

Test that the register page renders correctly with all expected elements.

```typescript
import { test, expect } from "@playwright/test";

test.describe("Register Page", () => {
	test("renders the registration form", async ({ page }) => {
		await page.goto("http://127.0.0.1:3000/register");

		// Header
		await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
		await expect(page.getByText("Register your business to start receiving bookings")).toBeVisible();

		// Form fields
		await expect(page.getByLabel("Full name")).toBeVisible();
		await expect(page.getByLabel("Business email")).toBeVisible();
		await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
		await expect(page.getByLabel("Confirm password")).toBeVisible();

		// Terms checkbox
		await expect(page.getByText("I agree to the")).toBeVisible();

		// Submit button
		await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();

		// Social login buttons
		await expect(page.getByRole("button", { name: /Google/ })).toBeVisible();
		await expect(page.getByRole("button", { name: /GitHub/ })).toBeVisible();
		await expect(page.getByRole("button", { name: /Apple/ })).toBeVisible();

		// Login link
		await expect(page.getByText("Already have an account?")).toBeVisible();
	});

	test("shows validation errors on empty submit", async ({ page }) => {
		await page.goto("http://127.0.0.1:3000/register");

		// Click submit without filling anything
		await page.getByRole("button", { name: "Create Account" }).click();

		// Should show at minimum that fields are required
		// (exact error behavior depends on TanStack Form's validation timing)
		await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
	});

	test("shows password strength bar when typing", async ({ page }) => {
		await page.goto("http://127.0.0.1:3000/register");

		const passwordInput = page.getByLabel("Password", { exact: true });
		await passwordInput.fill("Test1234!");

		// Strength bar should appear
		await expect(page.getByText("Strong")).toBeVisible();
	});
});
```

**Step 2: Run the E2E tests**

Run:
```bash
bun run e2e
```
Expected: Tests pass. If the dev server isn't running, start it first with `bun run dev`.

**Step 3: Commit**

```bash
git add tests/register.spec.ts
git commit -m "test(auth): add E2E tests for register page"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Install dependencies | `package.json`, `bun.lock` |
| 2 | Add WORKOS_API_KEY env var | `src/env.ts`, `.env.local` |
| 3 | Password strength bar | `src/components/register/password-strength-bar.tsx` |
| 4 | Social login buttons | `src/components/register/social-login-buttons.tsx` |
| 5 | Register hero panel | `src/components/register/register-hero.tsx` |
| 6 | Server functions + route shell | `src/routes/register.tsx` |
| 7 | Register form component | `src/components/register/register-form.tsx` |
| 8 | Assemble full page | `src/routes/register.tsx` (update) |
| 9 | Visual QA and polish | Various |
| 10 | E2E tests | `tests/register.spec.ts` |
