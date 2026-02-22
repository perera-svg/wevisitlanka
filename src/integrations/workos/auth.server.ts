import { createServerFn } from "@tanstack/react-start";
import {
	getRequestHeader,
	setResponseHeaders,
} from "@tanstack/react-start/server";
import { WorkOS } from "@workos-inc/node";
import { z } from "zod";
import type { SessionUser } from "./session";
import {
	buildClearSessionCookie,
	buildSessionCookie,
	createSessionToken,
	parseSessionCookie,
	verifySessionToken,
} from "./session";

const WORKOS_API_KEY = process.env.WORKOS_API_KEY;
if (!WORKOS_API_KEY) {
	throw new Error("WORKOS_API_KEY is not set in environment variables");
}

const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID;
if (!WORKOS_CLIENT_ID) {
	throw new Error("WORKOS_CLIENT_ID is not set in environment variables");
}

const WORKOS_REDIRECT_URI =
	process.env.WORKOS_REDIRECT_URI || "http://localhost:3000/auth/callback";

const workos = new WorkOS(WORKOS_API_KEY);

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
	setResponseHeaders(
		new Headers({
			"Set-Cookie": buildSessionCookie(token),
		}),
	);
}

// --- Get current session ---

export const getSession = createServerFn({ method: "GET" }).handler(
	async () => {
		const cookieHeader = getRequestHeader("cookie") ?? "";
		const token = parseSessionCookie(cookieHeader);

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
	.validator((data: z.infer<typeof registerSchema>) =>
		registerSchema.parse(data),
	)
	.handler(async ({ data }) => {
		const [firstName, ...rest] = data.name.trim().split(" ");
		const lastName = rest.join(" ") || null;

		try {
			const user = await workos.userManagement.createUser({
				email: data.email,
				password: data.password,
				firstName: firstName || null,
				lastName,
			});

			const authResult = await workos.userManagement.authenticateWithPassword({
				clientId: WORKOS_CLIENT_ID,
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
	.validator((data: z.infer<typeof loginSchema>) => loginSchema.parse(data))
	.handler(async ({ data }) => {
		try {
			const authResult = await workos.userManagement.authenticateWithPassword({
				clientId: WORKOS_CLIENT_ID,
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
	.validator((data: z.infer<typeof oauthProviderSchema>) =>
		oauthProviderSchema.parse(data),
	)
	.handler(async ({ data }) => {
		const url = await workos.userManagement.getAuthorizationUrl({
			provider: data.provider as OAuthProvider,
			clientId: WORKOS_CLIENT_ID,
			redirectUri: WORKOS_REDIRECT_URI,
		});
		return { url };
	});

export const handleOAuthCallback = createServerFn({ method: "GET" })
	.validator((data: { code: string }) => {
		if (!data.code) throw new Error("Authorization code is required");
		return data;
	})
	.handler(async ({ data }) => {
		const authResult = await workos.userManagement.authenticateWithCode({
			clientId: WORKOS_CLIENT_ID,
			code: data.code,
		});

		const sessionUser = toSessionUser(authResult.user);
		await setSessionCookie(sessionUser);

		return { success: true, user: sessionUser };
	});

// --- Sign out ---

export const signOutUser = createServerFn({ method: "POST" }).handler(
	async () => {
		setResponseHeaders(
			new Headers({
				"Set-Cookie": buildClearSessionCookie(),
			}),
		);
		return { success: true };
	},
);
