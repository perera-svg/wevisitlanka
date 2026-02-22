function getStrength(password: string): {
	score: number;
	label: string;
} {
	let score = 0;
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;
	if (/[A-Z]/.test(password)) score++;
	if (/[0-9]/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;

	if (score <= 1) return { score: 1, label: "Weak" };
	if (score <= 2) return { score: 2, label: "Fair" };
	if (score <= 3) return { score: 3, label: "Good" };
	return { score: 4, label: "Strong" };
}

const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

export default function PasswordStrength({ password }: { password: string }) {
	if (!password) return null;

	const { score, label } = getStrength(password);

	return (
		<div className="flex items-center gap-2">
			<div className="flex flex-1 gap-1">
				{[1, 2, 3, 4].map((level) => (
					<div
						key={level}
						className={`h-1 flex-1 rounded-full transition-colors ${
							level <= score ? colors[score - 1] : "bg-gray-200"
						}`}
					/>
				))}
			</div>
			<span className="text-xs text-gray-500">{label}</span>
		</div>
	);
}
