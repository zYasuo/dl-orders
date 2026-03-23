export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex min-h-[calc(100svh-3.5rem)] w-full min-w-0 flex-1 flex-col lg:grid lg:min-h-[calc(100svh-3.5rem)] lg:grid-cols-2 lg:bg-background">
            <aside className="relative hidden min-w-0 overflow-hidden border-border bg-muted lg:flex lg:flex-col lg:border-r">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,color-mix(in_oklab,var(--border)_75%,transparent)_1px,transparent_0)] bg-size-[24px_24px] opacity-50"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-foreground/[0.04] blur-3xl"
                />
                <div className="relative z-10 flex min-h-[calc(100svh-3.5rem)] w-full min-w-0 flex-col justify-between p-8 sm:p-10 xl:p-12">
                    <div className="w-full max-w-2xl space-y-8">
                        <div className="flex items-start gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-sm font-semibold shadow-sm">
                                dl
                            </span>
                            <div className="min-w-0 space-y-1 pt-0.5">
                                <p className="text-xl font-semibold tracking-tight text-foreground">dl-orders</p>
                                <p className="text-sm text-muted-foreground">Catálogo, conta e pedidos num só lugar.</p>
                            </div>
                        </div>
                        <ul className="space-y-3 border-t border-border/60 pt-8 text-sm leading-relaxed text-muted-foreground">
                            <li className="flex gap-3">
                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/40" aria-hidden />
                                <span>Entrada rápida com e-mail e senha; recuperação de acesso quando precisar.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/40" aria-hidden />
                                <span>Catálogo para escolher produtos e seguir para o checkout.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/40" aria-hidden />
                                <span>Fluxo de pedidos com sessão no servidor, sem expor token no armazenamento local.</span>
                            </li>
                        </ul>
                    </div>
                    <p className="w-full max-w-2xl text-xs text-muted-foreground/70">dl-orders · ambiente de estudo</p>
                </div>
            </aside>
            <div className="flex w-full min-w-0 flex-1 flex-col items-stretch justify-center bg-background px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
                <div className="mx-auto w-full max-w-xl">{children}</div>
            </div>
        </div>
    );
}
