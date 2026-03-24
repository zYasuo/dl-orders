import { Quantity } from '../../../src/domain/value-objects/quantity.vo';
import { DomainError } from '../../../src/domain/errors/domain.error';

describe('Quantity', () => {
  it('creates a valid quantity', () => {
    const qty = Quantity.create(5);
    expect(qty.value).toBe(5);
  });

  it('accepts minimum value of 1', () => {
    const qty = Quantity.create(1);
    expect(qty.value).toBe(1);
  });

  it('throws on zero', () => {
    expect(() => Quantity.create(0)).toThrow(DomainError);
  });

  it('throws on negative value', () => {
    expect(() => Quantity.create(-1)).toThrow(DomainError);
  });

  it('throws on decimal value', () => {
    expect(() => Quantity.create(1.5)).toThrow(DomainError);
  });

  it('throws on NaN', () => {
    expect(() => Quantity.create(NaN)).toThrow(DomainError);
  });

  it('equals returns true for same value', () => {
    const a = Quantity.create(3);
    const b = Quantity.create(3);
    expect(a.equals(b)).toBe(true);
  });

  it('equals returns false for different value', () => {
    const a = Quantity.create(3);
    const b = Quantity.create(4);
    expect(a.equals(b)).toBe(false);
  });

  it('exposes MIN_VALUE constant', () => {
    expect(Quantity.MIN_VALUE).toBe(1);
  });
});
