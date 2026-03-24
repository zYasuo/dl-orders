import { DomainError } from '../errors';

export class Quantity {
  static readonly MIN_VALUE = 1;

  private constructor(readonly value: number) {}

  static create(raw: number): Quantity {
    if (
      typeof raw !== 'number' ||
      !Number.isFinite(raw) ||
      !Number.isInteger(raw) ||
      raw < Quantity.MIN_VALUE
    ) {
      throw new DomainError('Invalid quantity');
    }

    return new Quantity(raw);
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }
}
