import { useNavigate } from "@tanstack/react-router";
import { AuthKitProvider } from "@workos-inc/authkit-react";
import { env } from "@/env";

const workosClientId = env.VITE_WORKOS_CLIENT_ID;
const workosApiHostname = env.VITE_WORKOS_API_HOSTNAME;
const redirectUri =
	typeof window !== "undefined"
		? `${window.location.origin}/callback`
		: undefined;

if (import.meta.env.DEV && typeof window !== "undefined") {
	console.debug("[WorkOS] clientId:", workosClientId);
	console.debug("[WorkOS] apiHostname:", workosApiHostname);
	console.debug("[WorkOS] redirectUri:", redirectUri);
}

export default function AppWorkOSProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const navigate = useNavigate();

	return (
		<AuthKitProvider
			clientId={workosClientId}
			apiHostname={workosApiHostname}
			redirectUri={redirectUri}
			onRedirectCallback={({ state }) => {
				if (state?.returnTo) {
					navigate(state.returnTo);
				}
			}}
		>
			{children}
		</AuthKitProvider>
	);
}
