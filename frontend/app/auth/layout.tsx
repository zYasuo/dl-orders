import Link from 'next/link';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex min-h-[calc(100svh-3.5rem)] w-full flex-col items-center justify-center gap-8 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
            <Link
                href="/products"
                className="text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
                Voltar ao catálogo
            </Link>
        </div>
    );
}
