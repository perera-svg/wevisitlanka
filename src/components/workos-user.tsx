import { Link } from "@tanstack/react-router";
import { useAuth } from "../integrations/workos/auth-context";

export default function SignInButton({ large }: { large?: boolean }) {
	const { user, isLoading, signOut } = useAuth();

	const buttonClasses = `${
		large ? "px-6 py-3 text-base" : "px-4 py-2 text-sm"
	} bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed`;

	if (user) {
		return (
			<div className="flex flex-col gap-3">
				<div className="flex items-center gap-2">
					{user.profilePictureUrl && (
						<img
							src={user.profilePictureUrl}
							alt={`Avatar of ${user.firstName} ${user.lastName}`}
							className="w-10 h-10 rounded-full"
						/>
					)}
					{user.firstName} {user.lastName}
				</div>
				<button
					type="button"
					onClick={() => signOut()}
					className={buttonClasses}
				>
					Sign Out
				</button>
			</div>
		);
	}

	return (
		<Link to="/login" className={`${buttonClasses} inline-block text-center`}>
			{isLoading ? "Loading..." : `Sign In${large ? " to Account" : ""}`}
		</Link>
	);
}
