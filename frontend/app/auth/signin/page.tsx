import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SigninForm } from '@/modules/auth/components/signin-form';

export default function SigninPage() {
    return (
        <Suspense fallback={<Skeleton className="h-128 w-full rounded-xl border border-border bg-card" />}>
            <SigninForm />
        </Suspense>
    );
}
