import { useNavigate } from "@tanstack/react-router";
import { AuthKitProvider } from "@workos-inc/authkit-react";
import { env } from "@/env";

const workosClientId = env.VITE_WORKOS_CLIENT_ID;
const workosApiHostname = env.VITE_WORKOS_API_HOSTNAME;

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
