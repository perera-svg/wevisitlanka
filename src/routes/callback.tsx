import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/callback")({
	ssr: false,
	component: CallbackPage,
});

function CallbackPage() {
	const { user, isLoading } = useAuth();
	const navigate = useNavigate();
	const [timedOut, setTimedOut] = useState(false);

	useEffect(() => {
		if (!isLoading && user) {
			navigate({ to: "/" });
		}
	}, [user, isLoading, navigate]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setTimedOut(true);
		}, 10_000);
		return () => clearTimeout(timeout);
	}, []);

	if (timedOut && !user) {
		return (
			<div className="flex h-screen flex-col items-center justify-center gap-4">
				<p className="text-sm text-red-600">
					Something went wrong during sign in.
				</p>
				<a
					href="/register"
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
