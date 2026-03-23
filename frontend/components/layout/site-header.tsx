'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSession } from '@/modules/auth/hooks/use-session';
import { signoutService } from '@/services/auth.service';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export function SiteHeader() {
    const router = useRouter();
    const { data: user, isSuccess, isError, isFetching } = useSession();
    const queryClient = useQueryClient();

    async function handleSignout() {
        try {
            await signoutService();
            await queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
            router.push('/products');
            router.refresh();
        } catch {}
    }

    const loggedIn = isSuccess && user && !isError;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <Link href="/products" className="text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90">
                    dl-orders
                </Link>
                <nav className="flex items-center gap-3 text-sm">
                    <Link href="/products" className="text-muted-foreground transition-colors hover:text-foreground">
                        Catálogo
                    </Link>
                    {loggedIn ? (
                        <>
                            <Link href="/account" className="text-muted-foreground transition-colors hover:text-foreground">
                                Conta
                            </Link>
                            <Button type="button" variant="ghost" size="sm" onClick={() => void handleSignout()}>
                                Sair
                            </Button>
                        </>
                    ) : isFetching ? (
                        <span className="text-muted-foreground">…</span>
                    ) : (
                        <Link href="/auth/signin">
                            <Button type="button" variant="secondary" size="sm">
                                Entrar
                            </Button>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
