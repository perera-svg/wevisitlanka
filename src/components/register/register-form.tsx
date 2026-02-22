import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@workos-inc/authkit-react";
import { Mail } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { PasswordStrengthBar } from "@/components/register/password-strength-bar";
import {
	type Provider,
	SocialLoginButtons,
} from "@/components/register/social-login-buttons";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/routes/register";

const fullNameSchema = z.string().min(1, "Full name is required");
const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters");

export function RegisterForm() {
	const navigate = useNavigate();
	const { getSignInUrl } = useAuth();
	const [serverError, setServerError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			fullName: "",
			email: "",
			password: "",
			confirmPassword: "",
			acceptTerms: false,
		},
		onSubmit: async ({ value }) => {
			setServerError(null);

			if (!value.acceptTerms) {
				setServerError("You must accept the Terms of Service.");
				return;
			}

			if (value.password !== value.confirmPassword) {
				setServerError("Passwords do not match.");
				return;
			}

			const nameParts = value.fullName.trim().split(/\s+/);
			const firstName = nameParts[0] ?? "";
			const lastName = nameParts.slice(1).join(" ") || firstName;

			try {
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
				if (error instanceof Error) {
					setServerError(error.message);
				} else {
					setServerError("An unexpected error occurred. Please try again.");
				}
			}
		},
	});

	async function handleSocialLogin(provider: Provider) {
		try {
			const signInUrl = await getSignInUrl();
			const url = new URL(signInUrl);
			url.searchParams.set("provider", provider);
			window.location.href = url.toString();
		} catch (error) {
			if (error instanceof Error) {
				setServerError(error.message);
			} else {
				setServerError("Failed to connect to login provider.");
			}
		}
	}

	return (
		<div className="flex w-full max-w-100 flex-col gap-7">
			{/* Logo */}
			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-lg bg-amber-500 font-bold text-white">
					SL
				</div>
				<div>
					<p className="text-sm font-semibold text-gray-900">
						Sri Lanka Tourism
					</p>
					<p className="text-xs text-gray-500">Business Portal</p>
				</div>
			</div>

			{/* Header */}
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold text-gray-900">
					Create your account
				</h1>
				<p className="text-sm text-gray-500">
					Register your business to start receiving bookings
				</p>
			</div>

			{/* Server error */}
			{serverError && (
				<div
					role="alert"
					className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
				>
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
						onBlur: fullNameSchema,
					}}
				>
					{(field) => (
						<Field
							data-invalid={
								field.state.meta.errors.length > 0 ? true : undefined
							}
						>
							<FieldLabel htmlFor={field.name}>Full name</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								type="text"
								placeholder="Enter your full name"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							{field.state.meta.errors.length > 0 && (
								<FieldError>{field.state.meta.errors.join(", ")}</FieldError>
							)}
						</Field>
					)}
				</form.Field>

				{/* Business Email */}
				<form.Field
					name="email"
					validators={{
						onBlur: emailSchema,
					}}
				>
					{(field) => (
						<Field
							data-invalid={
								field.state.meta.errors.length > 0 ? true : undefined
							}
						>
							<FieldLabel htmlFor={field.name}>Business email</FieldLabel>
							<div className="relative">
								<Mail className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
								<Input
									id={field.name}
									name={field.name}
									type="email"
									placeholder="Enter your business email"
									className="pl-9"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									aria-invalid={field.state.meta.errors.length > 0}
								/>
							</div>
							{field.state.meta.errors.length > 0 && (
								<FieldError>{field.state.meta.errors.join(", ")}</FieldError>
							)}
						</Field>
					)}
				</form.Field>

				{/* Password */}
				<form.Field
					name="password"
					validators={{
						onBlur: passwordSchema,
					}}
				>
					{(field) => (
						<Field
							data-invalid={
								field.state.meta.errors.length > 0 ? true : undefined
							}
						>
							<FieldLabel htmlFor={field.name}>Password</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								type="password"
								placeholder="Create a password"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							<PasswordStrengthBar password={field.state.value} />
							{field.state.meta.errors.length > 0 && (
								<FieldError>{field.state.meta.errors.join(", ")}</FieldError>
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
							if (value !== password) {
								return "Passwords do not match";
							}
							return undefined;
						},
					}}
				>
					{(field) => (
						<Field
							data-invalid={
								field.state.meta.errors.length > 0 ? true : undefined
							}
						>
							<FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								type="password"
								placeholder="Confirm your password"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								aria-invalid={field.state.meta.errors.length > 0}
							/>
							{field.state.meta.errors.length > 0 && (
								<FieldError>{field.state.meta.errors.join(", ")}</FieldError>
							)}
						</Field>
					)}
				</form.Field>

				{/* Terms of Service */}
				<form.Field name="acceptTerms">
					{(field) => (
						<div className="flex items-start gap-2">
							<input
								id={field.name}
								name={field.name}
								type="checkbox"
								className="mt-0.5 size-4 rounded border-gray-300 accent-amber-500"
								checked={field.state.value}
								onChange={(e) => field.handleChange(e.target.checked)}
								onBlur={field.handleBlur}
							/>
							<label
								htmlFor={field.name}
								className="text-xs leading-relaxed text-gray-600"
							>
								I agree to the{" "}
								<a
									href="/terms"
									className="font-medium text-teal-600 hover:underline"
								>
									Terms of Service
								</a>{" "}
								and{" "}
								<a
									href="/privacy"
									className="font-medium text-teal-600 hover:underline"
								>
									Privacy Policy
								</a>
							</label>
						</div>
					)}
				</form.Field>

				{/* Submit Button */}
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
						onProviderClick={handleSocialLogin}
						disabled={isSubmitting}
					/>
				)}
			</form.Subscribe>

			{/* Login Link */}
			<p className="text-center text-sm text-gray-500">
				Already have an account?{" "}
				<a href="/login" className="font-medium text-teal-600 hover:underline">
					Sign in &rarr;
				</a>
			</p>
		</div>
	);
}
