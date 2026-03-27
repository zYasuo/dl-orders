export type StockRow = {
    quantity: number;
    inStock: boolean;
    lastUnits: boolean;
};

export type StockLookupRow = {
    productId: string;
    quantity: number;
    inStock: boolean;
    lastUnits: boolean;
};

export function stockRowsToMap(rows: StockLookupRow[]): Record<string, StockRow> {
    const out: Record<string, StockRow> = {};
    for (const r of rows) {
        out[r.productId] = {
            quantity: r.quantity,
            inStock: r.inStock,
            lastUnits: r.lastUnits,
        };
    }
    return out;
}

export function mergeStockIntoProduct<T extends { id: string }>(
    item: T,
    stockById: Record<string, StockRow> | null,
): T & {
    stockQuantity?: number;
    inStock?: boolean;
    lastUnits?: boolean;
} {
    if (stockById === null) {
        return { ...item };
    }
    const s = stockById[item.id];
    if (!s) {
        return { ...item, stockQuantity: undefined, inStock: false, lastUnits: false };
    }
    return {
        ...item,
        stockQuantity: s.quantity,
        inStock: s.inStock,
        lastUnits: s.lastUnits,
    };
}
