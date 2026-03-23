import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold">404</h1>
            <p className="text-muted-foreground">Página ou recurso não encontrado.</p>
            <Link href="/products">
                <Button variant="secondary">Ir ao catálogo</Button>
            </Link>
        </div>
    );
}
