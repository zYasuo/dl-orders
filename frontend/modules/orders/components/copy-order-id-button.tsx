'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function CopyOrderIdButton({ orderId }: { orderId: string }) {
    const { toast } = useToast();
    const [done, setDone] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(orderId);
            setDone(true);
            toast({ message: 'Order number copied.', variant: 'success' });
            setTimeout(() => setDone(false), 2000);
        } catch {
            toast({ message: 'Could not copy.', variant: 'error' });
        }
    }

    return (
        <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={() => void handleCopy()}>
            {done ? 'Copied' : 'Copy'}
        </Button>
    );
}
