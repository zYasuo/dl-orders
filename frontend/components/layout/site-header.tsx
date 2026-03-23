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
        <header className="border-b border-border bg-card">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
                <Link href="/products" className="text-lg font-semibold text-foreground">
                    dl-orders
                </Link>
                <nav className="flex items-center gap-3 text-sm">
                    <Link href="/products" className="text-muted-foreground hover:text-foreground">
                        Catalog
                    </Link>
                    {loggedIn ? (
                        <>
                            <Link href="/account" className="text-muted-foreground hover:text-foreground">
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
