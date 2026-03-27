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
        <div className={cn('flex flex-col gap-4', className)}>
            <div
                id={panelId}
                className={cn(
                    'text-[15px] leading-[1.65] text-foreground/80 wrap-break-word whitespace-pre-wrap',
                    needsToggle && !expanded && 'max-h-64 overflow-hidden',
                    needsToggle && expanded && 'max-h-[min(55vh,28rem)] overflow-y-auto overscroll-y-contain pr-1 [scrollbar-gutter:stable]',
                )}
            >
                {text}
            </div>
            {needsToggle ? (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto w-fit px-0 py-0 text-[13px] font-normal text-muted-foreground underline-offset-4 hover:bg-transparent hover:text-foreground hover:underline"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setExpanded((v) => !v)}
                >
                    {expanded ? 'Show less' : 'Read more'}
                </Button>
            ) : null}
        </div>
    );
}
