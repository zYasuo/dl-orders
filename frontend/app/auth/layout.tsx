export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="relative flex min-h-svh w-full flex-1 flex-col items-center justify-center overflow-hidden bg-background p-6 md:p-10">
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-25%,color-mix(in_oklch,var(--primary)_20%,transparent),transparent_72%)]"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute bottom-0 left-1/2 h-[min(420px,55vh)] w-[min(680px,120%)] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-[radial-gradient(circle,color-mix(in_oklch,var(--primary)_8%,transparent)_0%,transparent_68%)] blur-2xl"
                aria-hidden
            />
            <div className="relative z-10 w-full max-w-[440px]">{children}</div>
        </div>
    );
}
