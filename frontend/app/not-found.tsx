import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
            <h1 className="text-2xl font-bold">404</h1>
            <p className="text-muted-foreground">Página ou recurso não encontrado.</p>
            <Link href="/products">
                <Button variant="secondary">Ir ao catálogo</Button>
            </Link>
        </div>
    );
}
