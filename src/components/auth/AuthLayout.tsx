export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen bg-white">
			{/* Left panel — form */}
			<div className="flex flex-1 flex-col justify-center px-8 py-12 md:px-16">
				<div className="mx-auto w-full max-w-[400px]">
					{/* Logo */}
					<div className="flex items-center gap-2.5 mb-7">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="white"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<title>Sri Lanka Tourism</title>
								<path d="M12 2L2 7l10 5 10-5-10-5z" />
								<path d="M2 17l10 5 10-5" />
								<path d="M2 12l10 5 10-5" />
							</svg>
						</div>
						<div>
							<div className="text-sm font-semibold text-gray-900 leading-tight">
								Sri Lanka Tourism
							</div>
							<div className="text-xs text-gray-500">Business Portal</div>
						</div>
					</div>

					{children}
				</div>
			</div>

			{/* Right panel — hero image with testimonial */}
			<div className="hidden lg:flex relative w-[640px] flex-shrink-0">
				<img
					src="https://images.unsplash.com/photo-1733937797040-3cd371a99892?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080"
					alt="Sri Lanka coastline"
					className="absolute inset-0 h-full w-full object-cover"
				/>
				{/* Testimonial overlay */}
				<div className="relative flex flex-col justify-end p-12 w-full">
					<div className="rounded-lg bg-black/40 p-6 backdrop-blur-sm">
						<p className="text-white text-base leading-relaxed mb-4">
							"The onboarding was so simple. Within a day I had my first listing
							live and inquiries coming in."
						</p>
						<div>
							<div className="text-white text-sm font-semibold">
								Priya Fernando
							</div>
							<div className="text-white/65 text-xs">
								Surf Bay Lessons &middot; Experience Provider
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
