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
            <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-3 sm:h-24 sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-6 lg:px-8">
                <Link
                    href="/products"
                    className="justify-self-start flex h-16 min-w-0 max-w-full items-center overflow-hidden transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm sm:h-24"
                >
                    <span className="relative flex h-7 max-w-[min(9rem,64vw)] items-center sm:h-10 sm:max-w-[min(92vw,13rem)]">
                        <Image
                            src="/logo/dl-logo.png"
                            alt="dl-orders"
                            width={561}
                            height={309}
                            className="h-full w-auto max-w-full object-contain object-left"
                            priority
                            sizes="(min-width: 640px) 13rem, 9rem"
                        />
                    </span>
                </Link>

                <nav className="flex shrink-0 justify-center px-1" aria-label="Main">
                    <Link
                        href="/products"
                        className={cn(
                            navText,
                            'whitespace-nowrap',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        )}
                    >
                        Catalog
                    </Link>
                </nav>

                <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-3">
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
