import { registerAs } from '@nestjs/config';

export type TRateLimitEndpointKey = 'signup' | 'verify-otp' | 'signin' | 'reset-password-link';

export interface IRateLimitEntry {
    max: number;
    windowSeconds: number;
}

export interface IRateLimitConfig {
    signup: IRateLimitEntry;
    'verify-otp': IRateLimitEntry;
    signin: IRateLimitEntry;
    'reset-password-link': IRateLimitEntry;
}

const defaultLimits: IRateLimitConfig = {
    signup: { max: 5, windowSeconds: 3600 },
    'verify-otp': { max: 10, windowSeconds: 900 },
    signin: { max: 10, windowSeconds: 60 },
    'reset-password-link': { max: 10, windowSeconds: 60 },
};

function parseIntEnv(name: string, defaultValue: number): number {
    const raw = process.env[name];
    if (raw === undefined || raw === '') return defaultValue;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : defaultValue;
}

export const rateLimitConfig = registerAs(
    'rateLimit',
    (): IRateLimitConfig => ({
        signup: {
            max: parseIntEnv('RATE_LIMIT_SIGNUP_MAX', defaultLimits.signup.max),
            windowSeconds: parseIntEnv(
                'RATE_LIMIT_SIGNUP_WINDOW_SECONDS',
                defaultLimits.signup.windowSeconds,
            ),
        },
        'verify-otp': {
            max: parseIntEnv('RATE_LIMIT_VERIFY_OTP_MAX', defaultLimits['verify-otp'].max),
            windowSeconds: parseIntEnv(
                'RATE_LIMIT_VERIFY_OTP_WINDOW_SECONDS',
                defaultLimits['verify-otp'].windowSeconds,
            ),
        },
        signin: {
            max: parseIntEnv('RATE_LIMIT_SIGNIN_MAX', defaultLimits.signin.max),
            windowSeconds: parseIntEnv(
                'RATE_LIMIT_SIGNIN_WINDOW_SECONDS',
                defaultLimits.signin.windowSeconds,
            ),
        },
        'reset-password-link': {
            max: parseIntEnv('RATE_LIMIT_RESET_PASSWORD_LINK_MAX', defaultLimits['reset-password-link'].max),
            windowSeconds: parseIntEnv(
                'RATE_LIMIT_RESET_PASSWORD_LINK_WINDOW_SECONDS',
                defaultLimits['reset-password-link'].windowSeconds,
            ),
        },
    }),
);
