export type StockUiState = 'purchasable' | 'out_of_stock' | 'unconfirmed';

export function getStockUiState(input: { inStock?: boolean; stockQuantity?: number }): StockUiState {
    if (input.inStock === undefined) {
        return 'unconfirmed';
    }
    if (input.inStock === false) {
        return 'out_of_stock';
    }
    if (typeof input.stockQuantity === 'number' && input.stockQuantity <= 0) {
        return 'out_of_stock';
    }
    return 'purchasable';
}

export function isPurchasableStock(input: { inStock?: boolean; stockQuantity?: number }): boolean {
    return getStockUiState(input) === 'purchasable';
}

export function isCartLinePurchasable(
    product: { inStock?: boolean; stockQuantity?: number } | null,
    stockLookupFailed: boolean,
): boolean {
    if (!product) {
        return false;
    }
    if (stockLookupFailed) {
        return false;
    }
    return isPurchasableStock(product);
}
