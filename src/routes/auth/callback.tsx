import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { handleOAuthCallback } from "../../integrations/workos/auth-api";
import { useAuth } from "../../integrations/workos/auth-context";

export const Route = createFileRoute("/auth/callback")({
	component: OAuthCallbackPage,
	ssr: false,
});

function OAuthCallbackPage() {
	const navigate = useNavigate();
	const { refreshSession } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const calledRef = useRef(false);

	useEffect(() => {
		if (calledRef.current) return;
		calledRef.current = true;

		const params = new URLSearchParams(window.location.search);
		const code = params.get("code");

		if (!code) {
			setError("No authorization code received");
			return;
		}

		handleOAuthCallback({ data: { code } })
			.then(async (result) => {
				if (result.success) {
					await refreshSession();
					navigate({ to: "/" });
				} else {
					setError(result.error ?? "Authentication failed");
				}
			})
			.catch((err: unknown) => {
				const message =
					err instanceof Error ? err.message : "Something went wrong";
				setError(message);
			});
	}, [navigate, refreshSession]);

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<p className="text-red-600 mb-4">{error}</p>
					<a href="/login" className="text-teal-600 hover:underline">
						Back to login
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mx-auto mb-4" />
				<p className="text-gray-500">Completing sign in...</p>
			</div>
		</div>
	);
}
