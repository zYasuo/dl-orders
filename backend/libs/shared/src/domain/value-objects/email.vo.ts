import { DomainError } from '../errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  static readonly MAX_LENGTH = 254;

  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    if (typeof raw !== 'string') {
      throw new DomainError('Invalid email');
    }

    const trimmed = raw.trim().toLowerCase();

    if (
      !trimmed ||
      trimmed.length > Email.MAX_LENGTH ||
      !EMAIL_REGEX.test(trimmed)
    ) {
      throw new DomainError('Invalid email');
    }

    return new Email(trimmed);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
