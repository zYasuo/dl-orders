'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-6 lg:px-8">
            <h1 className="text-xl font-semibold">Algo deu errado</h1>
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button type="button" onClick={() => reset()}>
                Tentar de novo
            </Button>
        </div>
    );
}
