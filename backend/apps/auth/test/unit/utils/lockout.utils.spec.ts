import {
    addMinutesToDate,
    lockoutEndFromNow,
    minutesRemainingUntil,
    LOCKOUT_MINUTES,
    MAX_LOGIN_ATTEMPTS,
} from '../../../src/utils/lockout.utils';

describe('lockout.utils', () => {
    const base = new Date('2025-01-01T12:00:00Z');

    beforeEach(() => {
        jest.useFakeTimers({ now: base.getTime() });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('constants', () => {
        it('MAX_LOGIN_ATTEMPTS is 3', () => {
            expect(MAX_LOGIN_ATTEMPTS).toBe(3);
        });
        
        it('LOCKOUT_MINUTES is 5', () => {
            expect(LOCKOUT_MINUTES).toBe(5);
        });
    });

    describe('addMinutesToDate', () => {
        it('returns date plus given minutes', () => {
            const result = addMinutesToDate(base, 5);
            expect(result.getTime()).toBe(base.getTime() + 5 * 60 * 1000);
        });
        it('handles zero', () => {
            const result = addMinutesToDate(base, 0);
            expect(result.getTime()).toBe(base.getTime());
        });
    });

    describe('lockoutEndFromNow', () => {
        it('returns now + minutes', () => {
            const result = lockoutEndFromNow(5);
            expect(result.getTime()).toBe(base.getTime() + 5 * 60 * 1000);
        });
    });

    describe('minutesRemainingUntil', () => {
        it('returns ceil minutes from now until date', () => {
            const until = new Date(base.getTime() + 3.2 * 60 * 1000);
            expect(minutesRemainingUntil(until)).toBe(4);
        });

        it('returns 0 when date is in the past', () => {
            const until = new Date(base.getTime() - 60000);
            expect(minutesRemainingUntil(until)).toBe(0);
        });

        it('accepts custom from date', () => {
            const until = new Date(base.getTime() + 10 * 60 * 1000);
            const from = new Date(base.getTime() + 3 * 60 * 1000);
            expect(minutesRemainingUntil(until, from)).toBe(7);
        });
    });
});
