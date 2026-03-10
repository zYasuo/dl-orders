/** Maximum failed login attempts before account is locked. */
export const MAX_LOGIN_ATTEMPTS = 3;

/** Duration (in minutes) the account remains locked after exceeding max attempts. */
export const LOCKOUT_MINUTES = 5;

const MS_PER_MINUTE = 60 * 1000;

/**
 * Returns a new Date that is `minutes` after the given date (or now if not provided).
 */
export function addMinutesToDate(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * MS_PER_MINUTE);
}

/**
 * Returns a Date representing now + the given minutes. Convenience for lockout end time.
 */
export function lockoutEndFromNow(minutes: number): Date {
    return addMinutesToDate(new Date(), minutes);
}

/**
 * Returns the number of full minutes remaining from now until the given date.
 * Returns 0 if the date is in the past. Use for user-facing "try again in X minutes" messages.
 */
export function minutesRemainingUntil(until: Date, from: Date = new Date()): number {
    const ms = until.getTime() - from.getTime();
    if (ms <= 0) return 0;
    return Math.ceil(ms / MS_PER_MINUTE);
}
