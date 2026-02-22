import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useId, useState } from "react";
import AuthLayout from "../components/auth/AuthLayout.tsx";
import PasswordStrength from "../components/auth/PasswordStrength.tsx";
import SocialLoginButtons from "../components/auth/SocialLoginButtons.tsx";
import { getOAuthUrl, registerUser } from "../integrations/workos/auth-api";

export const Route = createFileRoute("/register")({
	component: RegisterPage,
	ssr: false,
});

function RegisterPage() {
	const navigate = useNavigate();
	const id = useId();
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		tosAccepted: false,
	});
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
		setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (form.password !== form.confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (!form.tosAccepted) {
			setError("You must accept the Terms of Service");
			return;
		}

		setIsLoading(true);
		try {
			const result = await registerUser({
				data: {
					name: form.name,
					email: form.email,
					password: form.password,
				},
			});

			if (result.success) {
				navigate({ to: "/" });
			} else {
				setError(result.error ?? "Registration failed");
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
			<h1 className="text-[28px] font-bold text-gray-900">
				Create your account
			</h1>
			<p className="mt-2 text-sm text-gray-500 mb-7">
				Register your business to start receiving bookings
			</p>

			{error && (
				<div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Full name */}
				<div>
					<label
						htmlFor={`${id}-name`}
						className="block text-sm font-medium text-gray-700 mb-1.5"
					>
						Full name
					</label>
					<input
						id={`${id}-name`}
						name="name"
						type="text"
						required
						placeholder="Enter your full name"
						value={form.name}
						onChange={handleChange}
						className={inputClasses}
					/>
				</div>

				{/* Business email */}
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
					<label
						htmlFor={`${id}-password`}
						className="block text-sm font-medium text-gray-700 mb-1.5"
					>
						Password
					</label>
					<input
						id={`${id}-password`}
						name="password"
						type="password"
						required
						placeholder="Create a password"
						value={form.password}
						onChange={handleChange}
						className={inputClasses}
					/>
					<div className="mt-2">
						<PasswordStrength password={form.password} />
					</div>
				</div>

				{/* Confirm password */}
				<div>
					<label
						htmlFor={`${id}-confirmPassword`}
						className="block text-sm font-medium text-gray-700 mb-1.5"
					>
						Confirm password
					</label>
					<input
						id={`${id}-confirmPassword`}
						name="confirmPassword"
						type="password"
						required
						placeholder="Confirm your password"
						value={form.confirmPassword}
						onChange={handleChange}
						className={inputClasses}
					/>
				</div>

				{/* TOS checkbox */}
				<div className="flex items-start gap-2">
					<input
						id={`${id}-tos`}
						name="tosAccepted"
						type="checkbox"
						checked={form.tosAccepted}
						onChange={handleChange}
						className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
					/>
					<label htmlFor={`${id}-tos`} className="text-[13px] text-gray-500">
						I agree to the{" "}
						<a href="/terms" className="text-amber-600 hover:underline">
							Terms of Service
						</a>{" "}
						and{" "}
						<a href="/privacy" className="text-amber-600 hover:underline">
							Privacy Policy
						</a>
					</label>
				</div>

				{/* Submit */}
				<button
					type="submit"
					disabled={isLoading}
					className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
				>
					{isLoading ? "Creating account..." : "Create Account"}
				</button>
			</form>

			<SocialLoginButtons onProviderClick={handleOAuth} isLoading={isLoading} />

			{/* Login link */}
			<p className="mt-6 text-center text-[13px] text-gray-500">
				Already have an account?{" "}
				<Link to="/login" className="font-medium text-teal-600 hover:underline">
					Sign in &rarr;
				</Link>
			</p>
		</AuthLayout>
	);
}
