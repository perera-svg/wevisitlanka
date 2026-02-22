import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../integrations/workos/auth-context";
import type { SessionUser } from "../integrations/workos/session";

export const useUser = (): SessionUser | null => {
	const { user, isLoading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if (!isLoading && !user) {
			navigate({
				to: "/login",
				search: { returnTo: location.pathname },
			});
		}
	}, [isLoading, user, navigate, location.pathname]);

	return user;
};
