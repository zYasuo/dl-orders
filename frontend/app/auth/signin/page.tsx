import { Suspense } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { SigninForm } from '@/modules/auth/components/signin-form';

export default function SigninPage() {
    return (
        <>
            <Link href="/products" className="flex items-center gap-2 self-center font-medium text-foreground">
                <span className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                    dl
                </span>
                dl-orders
            </Link>
            <Suspense fallback={<Skeleton className="h-128 w-full rounded-xl border border-border bg-card" />}>
                <SigninForm />
            </Suspense>
        </>
    );
}
