import { AuthProvider } from "./auth-context";

export default function AppWorkOSProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return <AuthProvider>{children}</AuthProvider>;
}
