export const POST_LOGIN_FALLBACK = '/';

export const SIGNIN_REASON_CHECKOUT = 'checkout';
export const SIGNIN_REASON_ORDERS = 'orders';
export const SIGNIN_REASON_ACCOUNT = 'account';

const ALLOWED_PREFIXES = ['/products', '/checkout', '/orders', '/account', '/cart'] as const;

function isAllowedPathname(pathname: string): boolean {
    if (pathname === '/') {
        return true;
    }
    for (const prefix of ALLOWED_PREFIXES) {
        if (pathname === prefix) {
            return true;
        }
        if (pathname.startsWith(`${prefix}/`)) {
            return true;
        }
    }
    return false;
}

export function parseSafeReturnUrl(raw: string | null | undefined): string {
    if (raw == null) {
        return POST_LOGIN_FALLBACK;
    }
    const trimmed = raw.trim();
    if (!trimmed) {
        return POST_LOGIN_FALLBACK;
    }
    if (trimmed.includes('\\') || trimmed.includes('\0')) {
        return POST_LOGIN_FALLBACK;
    }
    if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
        return POST_LOGIN_FALLBACK;
    }

    const withoutHash = trimmed.split('#')[0] ?? '';
    const qIdx = withoutHash.indexOf('?');
    const pathRaw = qIdx >= 0 ? withoutHash.slice(0, qIdx) : withoutHash;
    const queryString = qIdx >= 0 ? withoutHash.slice(qIdx + 1) : '';

    let pathname: string;
    try {
        pathname = decodeURIComponent(pathRaw);
    } catch {
        return POST_LOGIN_FALLBACK;
    }

    if (pathname.includes('..') || pathname.includes('\0') || pathname.includes('//')) {
        return POST_LOGIN_FALLBACK;
    }
    if (!pathname.startsWith('/')) {
        return POST_LOGIN_FALLBACK;
    }
    if (pathname === '/auth' || pathname.startsWith('/auth/')) {
        return POST_LOGIN_FALLBACK;
    }
    if (pathname.startsWith('/api')) {
        return POST_LOGIN_FALLBACK;
    }
    if (!isAllowedPathname(pathname)) {
        return POST_LOGIN_FALLBACK;
    }

    if (pathname === '/' && queryString.length > 0) {
        return POST_LOGIN_FALLBACK;
    }

    if (queryString.length > 0) {
        try {
            new URLSearchParams(queryString);
        } catch {
            return POST_LOGIN_FALLBACK;
        }
        return `${pathname}?${queryString}`;
    }

    return pathname;
}

export function signInReasonForProtectedPath(pathname: string): string | null {
    if (pathname.startsWith('/checkout')) {
        return SIGNIN_REASON_CHECKOUT;
    }
    if (pathname.startsWith('/orders')) {
        return SIGNIN_REASON_ORDERS;
    }
    if (pathname.startsWith('/account')) {
        return SIGNIN_REASON_ACCOUNT;
    }
    return null;
}
