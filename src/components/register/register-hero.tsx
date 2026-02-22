export function RegisterHero() {
	return (
		<div
			className="relative hidden h-full w-1/2 bg-cover bg-center lg:flex lg:flex-col lg:justify-end"
			style={{
				backgroundImage:
					"url('https://images.unsplash.com/photo-1733937797040-3cd371a99892?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')",
			}}
		>
			<div className="mx-auto my-12 rounded-lg bg-black/40 p-6 max-w-4xl">
				<blockquote className="text-white">
					<p className="mb-4 leading-relaxed">
						&ldquo;The onboarding was so simple. Within a day I had my first
						listing live and inquiries coming in.&rdquo;
					</p>
					<footer>
						<p className="text-sm font-semibold">Priya Fernando</p>
						<p className="text-xs text-white/70">
							Surf Bay Lessons &middot; Experience Provider
						</p>
					</footer>
				</blockquote>
			</div>
		</div>
	);
}
