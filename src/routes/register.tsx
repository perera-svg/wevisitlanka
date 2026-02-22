import * as SentryServer from "@sentry/node";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useAuth } from "@workos-inc/authkit-react";
import { useEffect } from "react";
import { RegisterForm } from "@/components/register/register-form";
import { RegisterHero } from "@/components/register/register-hero";

const registerUser = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			email: string;
			password: string;
			firstName: string;
			lastName: string;
		}) => data,
	)
	.handler(async ({ data }) => {
		const { WorkOS } = await import("@workos-inc/node");
		const { env } = await import("@/env");

		const workos = new WorkOS(env.WORKOS_API_KEY, {
			clientId: env.VITE_WORKOS_CLIENT_ID,
		});

		return SentryServer.startSpan(
			{ name: "workos.createUser", op: "auth.register" },
			async () => {
				const user = await workos.userManagement.createUser({
					email: data.email,
					password: data.password,
					firstName: data.firstName,
					lastName: data.lastName,
				});

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
		<div className="fixed inset-0 z-50 flex h-screen bg-white">
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
