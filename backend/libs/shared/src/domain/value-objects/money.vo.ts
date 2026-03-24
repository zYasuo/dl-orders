import { DomainError } from '../errors';

export class Money {
  static readonly MIN_VALUE = 0;

  private constructor(readonly value: number) {}

  static create(raw: number): Money {
    if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < Money.MIN_VALUE) {
      throw new DomainError('Invalid money value');
    }

    const rounded = Math.round(raw * 100) / 100;
    return new Money(rounded);
  }

  add(other: Money): Money {
    return Money.create(this.value + other.value);
  }

  multiply(factor: number): Money {
    if (!Number.isFinite(factor) || factor < 0) {
      throw new DomainError('Invalid multiplication factor');
    }
    return Money.create(this.value * factor);
  }

  equals(other: Money): boolean {
    return this.value === other.value;
  }
}
