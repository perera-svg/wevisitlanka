import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

export interface SessionUser {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	profilePictureUrl: string | null;
}

function getSecretKey() {
	if (!JWT_SECRET_KEY) {
		throw new Error("JWT_SECRET_KEY is not set in environment variables");
	}
	return new TextEncoder().encode(JWT_SECRET_KEY);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
	return new SignJWT({ user })
		.setProtectedHeader({ alg: "HS256", typ: "JWT" })
		.setIssuedAt()
		.setExpirationTime("7d")
		.sign(getSecretKey());
}

export async function verifySessionToken(
	token: string,
): Promise<SessionUser | null> {
	try {
		const { payload } = await jwtVerify(token, getSecretKey());
		return (payload as { user: SessionUser }).user;
	} catch {
		return null;
	}
}

export function buildSessionCookie(token: string): string {
	return `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
}

export function buildClearSessionCookie(): string {
	return "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
}

export function parseSessionCookie(cookieHeader: string): string | null {
	const match = cookieHeader.match(/(?:^|;\s*)session=([^;]*)/);
	return match?.[1] || null;
}
