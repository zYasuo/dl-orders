import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { parseSafeReturnUrl } from '@/lib/routing/return-url';
import { SESSION_COOKIE_NAME } from '@/lib/session/constants';
import { SigninForm } from '@/modules/auth/components/signin-form';

type SearchParams = Promise<{ returnUrl?: string }>;

export default async function SigninPage({ searchParams }: { searchParams: SearchParams }) {
    const cookieStore = await cookies();
    if (cookieStore.get(SESSION_COOKIE_NAME)?.value) {
        const sp = await searchParams;
        redirect(parseSafeReturnUrl(sp.returnUrl));
    }
    return (
        <Suspense fallback={<Skeleton className="h-128 w-full rounded-xl border border-border bg-card" />}>
            <SigninForm />
        </Suspense>
    );
}
