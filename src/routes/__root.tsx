import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Scripts,
	useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import Header from "../components/Header";

import WorkOSProvider from "../integrations/workos/provider";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
});

const AUTH_ROUTES = ["/login", "/register", "/auth/callback"];

function RootDocument({ children }: { children: React.ReactNode }) {
	const { pathname } = useLocation();
	const isAuthPage = AUTH_ROUTES.includes(pathname);

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<WorkOSProvider>
					{!isAuthPage && <Header />}
					{children}
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				</WorkOSProvider>
				<Scripts />
			</body>
		</html>
	);
}
