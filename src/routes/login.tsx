import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useId, useState } from "react";
import AuthLayout from "../components/auth/AuthLayout.tsx";
import SocialLoginButtons from "../components/auth/SocialLoginButtons.tsx";
import { getOAuthUrl, loginUser } from "../integrations/workos/auth-api";

export const Route = createFileRoute("/login")({
	component: LoginPage,
	ssr: false,
});

function LoginPage() {
	const navigate = useNavigate();
	const id = useId();
	const [form, setForm] = useState({ email: "", password: "" });
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
		setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		try {
			const result = await loginUser({
				data: { email: form.email, password: form.password },
			});

			if (result.success) {
				navigate({ to: "/" });
			} else {
				setError(result.error ?? "Invalid credentials");
			}
		} catch {
			setError("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleOAuth = async (
		provider: "GoogleOAuth" | "GitHubOAuth" | "MicrosoftOAuth",
	) => {
		try {
			const { url } = await getOAuthUrl({ data: { provider } });
			window.location.href = url;
		} catch {
			setError("Failed to start social login");
		}
	};

	const inputClasses =
		"w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors";

	return (
		<AuthLayout>
			<h1 className="text-[28px] font-bold text-gray-900">Welcome back</h1>
			<p className="mt-2 text-sm text-gray-500 mb-7">
				Sign in to your business account
			</p>

			{error && (
				<div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Email */}
				<div>
					<label
						htmlFor={`${id}-email`}
						className="block text-sm font-medium text-gray-700 mb-1.5"
					>
						Business email
					</label>
					<div className="relative">
						<Mail
							size={16}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
						/>
						<input
							id={`${id}-email`}
							name="email"
							type="email"
							required
							placeholder="Enter your business email"
							value={form.email}
							onChange={handleChange}
							className={`${inputClasses} pl-9`}
						/>
					</div>
				</div>

				{/* Password */}
				<div>
					<div className="flex items-center justify-between mb-1.5">
						<label
							htmlFor={`${id}-password`}
							className="block text-sm font-medium text-gray-700"
						>
							Password
						</label>
						<a
							href="/forgot-password"
							className="text-xs text-teal-600 hover:underline"
						>
							Forgot password?
						</a>
					</div>
					<input
						id={`${id}-password`}
						name="password"
						type="password"
						required
						placeholder="Enter your password"
						value={form.password}
						onChange={handleChange}
						className={inputClasses}
					/>
				</div>

				{/* Submit */}
				<button
					type="submit"
					disabled={isLoading}
					className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
				>
					{isLoading ? "Signing in..." : "Sign In"}
				</button>
			</form>

			<SocialLoginButtons onProviderClick={handleOAuth} isLoading={isLoading} />

			{/* Register link */}
			<p className="mt-6 text-center text-[13px] text-gray-500">
				Don't have an account?{" "}
				<Link
					to="/register"
					className="font-medium text-teal-600 hover:underline"
				>
					Register &rarr;
				</Link>
			</p>
		</AuthLayout>
	);
}
