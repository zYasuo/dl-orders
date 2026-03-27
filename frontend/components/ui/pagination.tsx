import Link from 'next/link';
import { buildProductsCatalogHref } from '@/lib/catalog-href';
import { cn } from '@/lib/utils';

const linkBase =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

function catalogHref(page: number, limit: number, inStockOnly: boolean): string {
    return buildProductsCatalogHref({ page, limit, inStockOnly });
}

export function getCatalogPaginationItems(current: number, total: number): (number | 'ellipsis')[] {
    if (total <= 1) {
        return [];
    }
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const delta = 1;
    const middle: number[] = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        middle.push(i);
    }

    const items: (number | 'ellipsis')[] = [];

    if (current - delta > 2) {
        items.push(1, 'ellipsis');
    } else {
        items.push(1);
    }

    items.push(...middle);

    if (current + delta < total - 1) {
        items.push('ellipsis', total);
    } else if (total > 1) {
        items.push(total);
    }

    return items;
}

export type CatalogPaginationProps = {
    page: number;
    totalPages: number;
    limit: number;
    inStockOnly?: boolean;
};

export function CatalogPagination({ page, totalPages, limit, inStockOnly = false }: CatalogPaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    const items = getCatalogPaginationItems(page, totalPages);

    return (
        <nav aria-label="Catalog pagination" className="flex flex-wrap items-center justify-center gap-1">
            {page > 1 ? (
                <Link href={catalogHref(page - 1, limit, inStockOnly)} className={cn(linkBase, 'px-2 sm:min-w-auto sm:px-3')}>
                    Previous
                </Link>
            ) : (
                <span className={cn(linkBase, 'pointer-events-none opacity-40', 'px-2 sm:px-3')}>Previous</span>
            )}

            {items.map((item, idx) =>
                item === 'ellipsis' ? (
                    <span
                        key={`e-${idx}`}
                        className="inline-flex h-9 min-w-9 items-center justify-center px-1 text-sm text-muted-foreground"
                    >
                        …
                    </span>
                ) : (
                    <Link
                        key={item}
                        href={catalogHref(item, limit, inStockOnly)}
                        className={cn(linkBase, item === page && 'border-primary bg-primary text-primary-foreground hover:bg-primary/90')}
                        aria-current={item === page ? 'page' : undefined}
                    >
                        {item}
                    </Link>
                ),
            )}

            {page < totalPages ? (
                <Link href={catalogHref(page + 1, limit, inStockOnly)} className={cn(linkBase, 'px-2 sm:min-w-auto sm:px-3')}>
                    Next
                </Link>
            ) : (
                <span className={cn(linkBase, 'pointer-events-none opacity-40', 'px-2 sm:px-3')}>Next</span>
            )}
        </nav>
    );
}
