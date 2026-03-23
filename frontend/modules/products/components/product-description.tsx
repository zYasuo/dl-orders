'use client';

import { useId, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const COLLAPSED_MAX_CHARS = 720;
const COLLAPSED_MAX_LINES = 14;

type ProductDescriptionProps = {
    text: string;
    className?: string;
};

export function ProductDescription({ text, className }: ProductDescriptionProps) {
    const [expanded, setExpanded] = useState(false);
    const panelId = useId();
    const needsToggle = useMemo(() => {
        const lines = text.split(/\n/).length;
        return text.length > COLLAPSED_MAX_CHARS || lines > COLLAPSED_MAX_LINES;
    }, [text]);

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            <div
                id={panelId}
                className={cn(
                    'rounded-lg border border-border/60 bg-muted/20 text-sm leading-relaxed wrap-break-word text-muted-foreground whitespace-pre-wrap',
                    needsToggle && !expanded && 'max-h-64 overflow-hidden',
                    needsToggle && expanded && 'max-h-[min(55vh,28rem)] overflow-y-auto overscroll-y-contain pr-1 [scrollbar-gutter:stable]',
                )}
            >
                <div className="p-4">{text}</div>
            </div>
            {needsToggle ? (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-fit px-2 text-muted-foreground hover:text-foreground"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setExpanded((v) => !v)}
                >
                    {expanded ? 'Mostrar menos' : 'Mostrar descrição completa'}
                </Button>
            ) : null}
        </div>
    );
}
