import { Money } from '../../../src/domain/value-objects/money.vo';
import { DomainError } from '../../../src/domain/errors/domain.error';

describe('Money', () => {
  it('creates a valid money value', () => {
    const money = Money.create(99.99);
    expect(money.value).toBe(99.99);
  });

  it('rounds to 2 decimal places', () => {
    const money = Money.create(10.999);
    expect(money.value).toBe(11);
  });

  it('accepts zero', () => {
    const money = Money.create(0);
    expect(money.value).toBe(0);
  });

  it('throws on negative value', () => {
    expect(() => Money.create(-1)).toThrow(DomainError);
  });

  it('throws on NaN', () => {
    expect(() => Money.create(NaN)).toThrow(DomainError);
  });

  it('throws on Infinity', () => {
    expect(() => Money.create(Infinity)).toThrow(DomainError);
  });

  it('adds two money values', () => {
    const a = Money.create(10.5);
    const b = Money.create(20.3);
    expect(a.add(b).value).toBeCloseTo(30.8);
  });

  it('multiplies by factor', () => {
    const money = Money.create(99.9);
    const result = money.multiply(3);
    expect(result.value).toBeCloseTo(299.7);
  });

  it('throws on negative multiplication factor', () => {
    const money = Money.create(10);
    expect(() => money.multiply(-1)).toThrow(DomainError);
  });

  it('equals returns true for same value', () => {
    const a = Money.create(42.0);
    const b = Money.create(42.0);
    expect(a.equals(b)).toBe(true);
  });

  it('equals returns false for different value', () => {
    const a = Money.create(42.0);
    const b = Money.create(42.01);
    expect(a.equals(b)).toBe(false);
  });
});
