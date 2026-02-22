import { cn } from "@/lib/utils";

function computeStrength(password: string): number {
	let score = 0;
	if (password.length >= 8) score++;
	if (/[A-Z]/.test(password)) score++;
	if (/[0-9]/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;
	return score;
}

const strengthColors = [
	"bg-destructive",
	"bg-orange-500",
	"bg-yellow-500",
	"bg-green-500",
];

function strengthLabel(score: number): string {
	if (score === 0) return "";
	if (score === 1) return "Weak";
	if (score === 2) return "Fair";
	if (score === 3) return "Good";
	return "Strong";
}

export function PasswordStrengthBar({ password }: { password: string }) {
	const score = computeStrength(password);

	if (!password) return null;

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex gap-1">
				{[0, 1, 2, 3].map((i) => (
					<div
						key={`strength-${i}`}
						className={cn(
							"h-1 flex-1 rounded-full transition-colors",
							i < score ? strengthColors[score - 1] : "bg-border",
						)}
					/>
				))}
			</div>
			<p className="text-muted-foreground text-xs">{strengthLabel(score)}</p>
		</div>
	);
}
