import { describe, it, expect } from 'vitest';
import { getStockUiState, isCartLinePurchasable, isPurchasableStock } from '@/modules/products/lib/stock-status';

describe('getStockUiState', () => {
    it('returns unconfirmed when inStock is undefined', () => {
        expect(getStockUiState({})).toBe('unconfirmed');
        expect(getStockUiState({ stockQuantity: 5 })).toBe('unconfirmed');
    });

    it('returns out_of_stock when inStock is false', () => {
        expect(getStockUiState({ inStock: false })).toBe('out_of_stock');
        expect(getStockUiState({ inStock: false, stockQuantity: 0 })).toBe('out_of_stock');
    });

    it('returns out_of_stock when inStock is true and quantity is 0', () => {
        expect(getStockUiState({ inStock: true, stockQuantity: 0 })).toBe('out_of_stock');
    });

    it('returns purchasable when inStock is true and quantity omitted', () => {
        expect(getStockUiState({ inStock: true })).toBe('purchasable');
    });

    it('returns purchasable when inStock is true and quantity positive', () => {
        expect(getStockUiState({ inStock: true, stockQuantity: 3 })).toBe('purchasable');
    });

    it('treats lastUnits as purchasable when stock positive', () => {
        expect(getStockUiState({ inStock: true, stockQuantity: 2 })).toBe('purchasable');
    });
});

describe('isPurchasableStock', () => {
    it('mirrors purchasable state', () => {
        expect(isPurchasableStock({ inStock: true, stockQuantity: 1 })).toBe(true);
        expect(isPurchasableStock({ inStock: false })).toBe(false);
        expect(isPurchasableStock({})).toBe(false);
    });
});

describe('isCartLinePurchasable', () => {
    it('returns false when product is null', () => {
        expect(isCartLinePurchasable(null, false)).toBe(false);
    });

    it('returns false when stock lookup failed', () => {
        expect(isCartLinePurchasable({ inStock: true, stockQuantity: 5 }, true)).toBe(false);
    });

    it('returns true when product is purchasable and lookup ok', () => {
        expect(isCartLinePurchasable({ inStock: true, stockQuantity: 5 }, false)).toBe(true);
    });
});
