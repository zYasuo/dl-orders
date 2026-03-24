import { Email } from '../../../src/domain/value-objects/email.vo';
import { DomainError } from '../../../src/domain/errors/domain.error';

describe('Email', () => {
  it('creates a valid email', () => {
    const email = Email.create('User@Example.COM');
    expect(email.value).toBe('user@example.com');
  });

  it('trims whitespace', () => {
    const email = Email.create('  foo@bar.com  ');
    expect(email.value).toBe('foo@bar.com');
  });

  it('throws on empty string', () => {
    expect(() => Email.create('')).toThrow(DomainError);
  });

  it('throws on invalid format', () => {
    expect(() => Email.create('not-an-email')).toThrow(DomainError);
  });

  it('throws when exceeding max length', () => {
    const longLocal = 'a'.repeat(250);
    expect(() => Email.create(`${longLocal}@b.com`)).toThrow(DomainError);
  });

  it('equals returns true for same value', () => {
    const a = Email.create('foo@bar.com');
    const b = Email.create('FOO@bar.com');
    expect(a.equals(b)).toBe(true);
  });

  it('equals returns false for different value', () => {
    const a = Email.create('foo@bar.com');
    const b = Email.create('baz@bar.com');
    expect(a.equals(b)).toBe(false);
  });

  it('exposes MAX_LENGTH constant', () => {
    expect(Email.MAX_LENGTH).toBe(254);
  });
});
