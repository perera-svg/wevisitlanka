import * as SentryServer from "@sentry/node";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useAuth } from "@workos-inc/authkit-react";
import { useEffect } from "react";
import { z } from "zod";
import { RegisterForm } from "@/components/register/register-form";
import { RegisterHero } from "@/components/register/register-hero";

const registerInputSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string(),
});

const registerUser = createServerFn({ method: "POST" })
	.inputValidator((data: z.input<typeof registerInputSchema>) =>
		registerInputSchema.parse(data),
	)
	.handler(async ({ data }) => {
		const { WorkOS } = await import("@workos-inc/node");
		const { env } = await import("@/env");

		if (!env.WORKOS_API_KEY) {
			throw new Error(
				"Registration is not configured. Missing WORKOS_API_KEY.",
			);
		}

		const workos = new WorkOS(env.WORKOS_API_KEY, {
			clientId: env.VITE_WORKOS_CLIENT_ID,
		});

		return SentryServer.startSpan(
			{ name: "workos.createUser", op: "auth.register" },
			async () => {
				try {
					await workos.userManagement.createUser({
						email: data.email,
						password: data.password,
						firstName: data.firstName,
						lastName: data.lastName,
					});

					return { success: true as const };
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: "Registration failed. Please try again.";
					throw new Error(message);
				}
			},
		);
	});

export const Route = createFileRoute("/register")({
	ssr: false,
	component: RegisterPage,
});

function RegisterPage() {
	const { user, isLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && user) {
			navigate({ to: "/" });
		}
	}, [user, isLoading, navigate]);

	if (isLoading || user) {
		return (
			<div className="flex h-screen items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-50 flex bg-white">
			{/* Left Panel - Form */}
			<div className="scrollbar-thin-hover flex flex-1 items-center justify-center overflow-y-auto px-8 py-12 lg:px-16">
				<RegisterForm />
			</div>

			{/* Right Panel - Hero Image */}
			<RegisterHero />
		</div>
	);
}

export { registerUser };
