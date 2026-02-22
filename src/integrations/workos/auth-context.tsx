import { useNavigate } from "@tanstack/react-router";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { getSession, signOutUser } from "./auth-api";
import type { SessionUser } from "./session";

interface AuthContextValue {
	user: SessionUser | null;
	isLoading: boolean;
	signOut: () => Promise<void>;
	refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<SessionUser | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	const refreshSession = useCallback(async () => {
		try {
			const session = await getSession();
			setUser(session.user);
		} catch {
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		refreshSession();
	}, [refreshSession]);

	const signOut = useCallback(async () => {
		await signOutUser();
		setUser(null);
		navigate({ to: "/login" });
	}, [navigate]);

	return (
		<AuthContext value={{ user, isLoading, signOut, refreshSession }}>
			{children}
		</AuthContext>
	);
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
