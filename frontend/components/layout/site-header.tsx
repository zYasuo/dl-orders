'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SiteHeaderUserMenu } from '@/components/layout/site-header-user-menu';
import { useSession } from '@/modules/auth/hooks/use-session';
import { CartHeaderDropdown } from '@/modules/cart/components/cart-header-dropdown';
import { cn } from '@/lib/utils';

const navText = 'inline-flex items-center text-[13px] font-normal text-muted-foreground transition-colors duration-200 hover:text-foreground';

export function SiteHeader() {
    const { data: user, isSuccess, isError, isFetching } = useSession();
    const loggedIn = isSuccess && user && !isError;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80">
            <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:h-24 sm:gap-4 sm:px-6 lg:px-8">
                <Link
                    href="/products"
                    className="justify-self-start flex h-16 items-center transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm sm:h-24"
                >
                    <span className="relative block h-20 w-64 shrink-0 overflow-hidden sm:h-24 sm:w-[min(92vw,28rem)]">
                        <Image src="/logo/dl-logo.png" alt="dl-orders" width={280} height={120} className="h-20 w-auto sm:h-24" priority />
                    </span>
                </Link>

                <nav className="flex justify-center" aria-label="Main">
                    <Link
                        href="/products"
                        className={cn(
                            navText,
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        )}
                    >
                        Catalog
                    </Link>
                </nav>

                <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
                    <CartHeaderDropdown />
                    {loggedIn ? (
                        <SiteHeaderUserMenu user={user} />
                    ) : isFetching ? (
                        <span className="text-[13px] text-muted-foreground">…</span>
                    ) : (
                        <Link href="/auth/signin" className="shrink-0">
                            <Button type="button" variant="secondary" size="sm">
                                Sign in
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
