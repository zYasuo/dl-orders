'use client';

import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useProfile } from '@/modules/account/hooks/use-profile';
import { ProfileForm } from '@/modules/account/components/profile-form';
import { AccountUserIdentity } from '@/modules/account/components/account-user-identity';
import { MyOrdersSection } from '@/modules/orders/components/my-orders-section';
import { ApiError } from '@/types/api';

const navLinkClass = cn(
    'inline-flex w-full items-center rounded-md px-3 py-2 text-[13px] font-normal text-muted-foreground transition-colors duration-200',
    'hover:bg-muted/80 hover:text-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
);

function AccountPageSkeleton() {
    return (
        <div className="space-y-8" aria-busy="true" aria-label="Loading account">
            <div className="flex items-center gap-4 border-b border-border pb-6">
                <Skeleton className="size-14 shrink-0 rounded-full sm:size-16" />
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-6 w-48 max-w-full" />
                    <Skeleton className="h-4 w-64 max-w-full" />
                </div>
            </div>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,220px)_1fr] lg:items-start lg:gap-10">
                <Skeleton className="hidden h-40 rounded-xl border border-border lg:block" />
                <Skeleton className="h-56 rounded-xl border border-border lg:h-72" />
            </div>
        </div>
    );
}

export function AccountPageContent() {
    const { data: user, isLoading, isError, error } = useProfile();

    if (isLoading) {
        return <AccountPageSkeleton />;
    }

    if (isError || !user) {
        const msg = error instanceof ApiError ? error.message : 'Could not load profile.';
        return <Alert variant="error">{msg}</Alert>;
    }

    return (
        <main className="w-full" aria-label="Account settings">
            <AccountUserIdentity user={user} />

            <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,220px)_1fr] lg:items-start lg:gap-10">
                <nav
                    className="lg:sticky lg:top-28 lg:self-start"
                    aria-label="Account sections"
                >
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Sections</p>
                    <ul className="flex flex-row gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 lg:flex-col lg:overflow-visible">
                        <li className="shrink-0 lg:shrink">
                            <a href="#profile" className={navLinkClass}>
                                Profile
                            </a>
                        </li>
                        <li className="shrink-0 lg:shrink">
                            <a href="#shopping" className={navLinkClass}>
                                Shopping
                            </a>
                        </li>
                        <li className="shrink-0 lg:shrink">
                            <a href="#orders" className={navLinkClass}>
                                Orders
                            </a>
                        </li>
                        <li className="shrink-0 lg:shrink">
                            <a href="#security" className={navLinkClass}>
                                Security
                            </a>
                        </li>
                    </ul>
                </nav>

                <div className="min-w-0 space-y-10 lg:space-y-12">
                    <section
                        id="profile"
                        className="scroll-mt-28 sm:scroll-mt-32"
                        aria-labelledby="account-profile-heading"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle id="account-profile-heading">Profile</CardTitle>
                                <CardDescription>Data synced with the Users service. Email is read-only.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ProfileForm />
                            </CardContent>
                        </Card>
                    </section>

                    <section
                        id="shopping"
                        className="scroll-mt-28 sm:scroll-mt-32"
                        aria-labelledby="account-shopping-heading"
                    >
                        <h2 id="account-shopping-heading" className="mb-4 text-base font-semibold text-foreground">
                            Shopping
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-base">Cart</CardTitle>
                                    <CardDescription>Review items before checkout.</CardDescription>
                                </CardHeader>
                                <CardFooter className="mt-auto w-full flex-col items-stretch gap-0 pt-5">
                                    <Link href="/cart" className={buttonVariants({ variant: 'secondary', className: 'w-full' })}>
                                        Open cart
                                    </Link>
                                </CardFooter>
                            </Card>
                            <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-base">Checkout</CardTitle>
                                    <CardDescription>Place an order from your cart.</CardDescription>
                                </CardHeader>
                                <CardFooter className="mt-auto w-full flex-col items-stretch gap-0 pt-5">
                                    <Link href="/checkout" className={buttonVariants({ variant: 'secondary', className: 'w-full' })}>
                                        Go to checkout
                                    </Link>
                                </CardFooter>
                            </Card>
                            <Card className="flex flex-col sm:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-base">Catalog</CardTitle>
                                    <CardDescription>Browse products and add them to your cart.</CardDescription>
                                </CardHeader>
                                <CardFooter className="mt-auto w-full flex-col items-stretch gap-0 pt-5">
                                    <Link href="/products" className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
                                        Browse catalog
                                    </Link>
                                </CardFooter>
                            </Card>
                        </div>
                        <div id="orders" className="mt-8 scroll-mt-28 sm:scroll-mt-32">
                            <MyOrdersSection />
                        </div>
                    </section>

                    <section
                        id="security"
                        className="scroll-mt-28 sm:scroll-mt-32"
                        aria-labelledby="account-security-heading"
                    >
                        <h2 id="account-security-heading" className="mb-4 text-base font-semibold text-foreground">
                            Security
                        </h2>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Password</CardTitle>
                                <CardDescription>
                                    Password resets are email-based: we send a link that opens the page where you enter
                                    your new password (the URL includes a one-time token from that email).
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                                <Link
                                    href="/auth/reset-password"
                                    className={buttonVariants({ variant: 'secondary', className: 'w-full sm:w-auto' })}
                                >
                                    Email me a reset link
                                </Link>
                                <p className="text-[13px] text-muted-foreground sm:max-w-md">
                                    Already started? Open the link from your inbox—do not share it. There is no separate
                                    “change password” screen without that link in this MVP.
                                </p>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>
        </main>
    );
}
