import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/callback")({
	ssr: false,
	component: CallbackPage,
});

function CallbackPage() {
	const { user, isLoading } = useAuth();
	const navigate = useNavigate();
	const [timedOut, setTimedOut] = useState(false);

	// Check for explicit error params from WorkOS redirect
	const urlError = useMemo(() => {
		if (typeof window === "undefined") return null;
		const params = new URLSearchParams(window.location.search);
		const error = params.get("error");
		const description = params.get("error_description");
		if (error) {
			return {
				code: error,
				description: description ?? "Authentication failed.",
			};
		}
		return null;
	}, []);

	// Navigate home on successful auth
	useEffect(() => {
		if (!isLoading && user) {
			navigate({ to: "/" });
		}
	}, [user, isLoading, navigate]);

	// Fallback timeout for cases where SDK loading hangs
	useEffect(() => {
		const timeout = setTimeout(() => {
			setTimedOut(true);
		}, 15_000);
		return () => clearTimeout(timeout);
	}, []);

	// Auth failed: SDK finished loading but no user was set
	const authFailed = !isLoading && !user;
	const hasError = urlError !== null || authFailed || timedOut;

	if (hasError) {
		const errorMessage = urlError
			? `${urlError.description} (${urlError.code})`
			: authFailed
				? "Authentication failed. The login provider returned an error during sign in."
				: "Authentication timed out. Please try again.";

		return (
			<div className="flex h-screen flex-col items-center justify-center gap-4 px-4">
				<div className="flex max-w-md flex-col items-center gap-3 text-center">
					<p className="text-sm font-medium text-red-600">{errorMessage}</p>
					{import.meta.env.DEV && (
						<p className="text-xs text-gray-400">
							Check the browser console for details. Common causes: redirect URI
							not registered in WorkOS dashboard, email verification required,
							OAuth provider not enabled, or client ID mismatch.
						</p>
					)}
				</div>
				<a
					href="/"
					className="text-sm font-medium text-teal-600 hover:underline"
				>
					Try again &rarr;
				</a>
			</div>
		);
	}

	return (
		<div className="flex h-screen items-center justify-center">
			<p className="text-muted-foreground">Signing you in...</p>
		</div>
	);
}
