import { createServerFn } from "@tanstack/react-start";
import {
	deleteCookie,
	getCookie,
	setCookie,
} from "@tanstack/react-start/server";
import { WorkOS } from "@workos-inc/node";
import { z } from "zod";
import type { SessionUser } from "./session";
import { createSessionToken, verifySessionToken } from "./session";

let _workos: WorkOS | null = null;

function getWorkOS(): WorkOS {
	if (!_workos) {
		const apiKey = process.env.WORKOS_API_KEY;
		if (!apiKey) {
			throw new Error("WORKOS_API_KEY is not set in environment variables");
		}
		_workos = new WorkOS(apiKey);
	}
	return _workos;
}

function getClientId(): string {
	const clientId = process.env.WORKOS_CLIENT_ID;
	if (!clientId) {
		throw new Error("WORKOS_CLIENT_ID is not set in environment variables");
	}
	return clientId;
}

function getRedirectUri(): string {
	return (
		process.env.WORKOS_REDIRECT_URI || "http://localhost:3000/auth/callback"
	);
}

function toSessionUser(user: {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	profilePictureUrl: string | null;
}): SessionUser {
	return {
		id: user.id,
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
		profilePictureUrl: user.profilePictureUrl,
	};
}

async function setSessionCookie(user: SessionUser) {
	const token = await createSessionToken(user);
	setCookie("session", token, {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 7,
	});
}

// --- Get current session ---

export const getSession = createServerFn({ method: "GET" }).handler(
	async () => {
		const token = getCookie("session");

		if (!token) return { user: null };

		const user = await verifySessionToken(token);
		return { user };
	},
);

// --- Register ---

const registerSchema = z.object({
	name: z.string().min(1, "Full name is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerUser = createServerFn({ method: "POST" })
	.inputValidator(registerSchema)
	.handler(async ({ data }) => {
		const [firstName, ...rest] = data.name.trim().split(" ");
		const lastName = rest.join(" ") || null;

		try {
			const user = await getWorkOS().userManagement.createUser({
				email: data.email,
				password: data.password,
				firstName: firstName || undefined,
				lastName: lastName || undefined,
			});

			const authResult =
				await getWorkOS().userManagement.authenticateWithPassword({
					clientId: getClientId(),
					email: data.email,
					password: data.password,
				});

			const sessionUser = toSessionUser(authResult.user ?? user);
			await setSessionCookie(sessionUser);

			return { success: true, user: sessionUser };
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Registration failed";
			return { success: false, error: message };
		}
	});

// --- Login ---

const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export const loginUser = createServerFn({ method: "POST" })
	.inputValidator(loginSchema)
	.handler(async ({ data }) => {
		try {
			const authResult =
				await getWorkOS().userManagement.authenticateWithPassword({
					clientId: getClientId(),
					email: data.email,
					password: data.password,
				});

			const sessionUser = toSessionUser(authResult.user);
			await setSessionCookie(sessionUser);

			return { success: true, user: sessionUser };
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Invalid credentials";
			return { success: false, error: message };
		}
	});

// --- OAuth ---

type OAuthProvider = "GoogleOAuth" | "GitHubOAuth" | "MicrosoftOAuth";

const oauthProviderSchema = z.object({
	provider: z.enum(["GoogleOAuth", "GitHubOAuth", "MicrosoftOAuth"]),
});

export const getOAuthUrl = createServerFn({ method: "GET" })
	.inputValidator(oauthProviderSchema)
	.handler(async ({ data }) => {
		const url = getWorkOS().userManagement.getAuthorizationUrl({
			provider: data.provider as OAuthProvider,
			clientId: getClientId(),
			redirectUri: getRedirectUri(),
		});
		return { url };
	});

export const handleOAuthCallback = createServerFn({ method: "GET" })
	.inputValidator((data: { code: string }) => {
		if (!data.code) throw new Error("Authorization code is required");
		return data;
	})
	.handler(async ({ data }) => {
		try {
			const authResult = await getWorkOS().userManagement.authenticateWithCode({
				clientId: getClientId(),
				code: data.code,
			});

			const sessionUser = toSessionUser(authResult.user);
			await setSessionCookie(sessionUser);

			return { success: true, user: sessionUser };
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "OAuth authentication failed";
			return { success: false, error: message };
		}
	});

// --- Sign out ---

export const signOutUser = createServerFn({ method: "POST" }).handler(
	async () => {
		deleteCookie("session", { path: "/" });
		return { success: true };
	},
);
