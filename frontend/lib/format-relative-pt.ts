export function formatRelativeEn(iso: string): string {
    const date = new Date(iso);
    const diffMs = date.getTime() - Date.now();
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const abs = Math.abs(diffMs);
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (abs < minute) {
        return rtf.format(Math.round(diffMs / 1000), 'second');
    }
    if (abs < hour) {
        return rtf.format(Math.round(diffMs / minute), 'minute');
    }
    if (abs < day) {
        return rtf.format(Math.round(diffMs / hour), 'hour');
    }
    if (abs < 30 * day) {
        return rtf.format(Math.round(diffMs / day), 'day');
    }
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

export function formatRelativePtBr(iso: string): string {
    const date = new Date(iso);
    const diffMs = date.getTime() - Date.now();
    const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
    const abs = Math.abs(diffMs);
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (abs < minute) {
        return rtf.format(Math.round(diffMs / 1000), 'second');
    }
    if (abs < hour) {
        return rtf.format(Math.round(diffMs / minute), 'minute');
    }
    if (abs < day) {
        return rtf.format(Math.round(diffMs / hour), 'hour');
    }
    if (abs < 30 * day) {
        return rtf.format(Math.round(diffMs / day), 'day');
    }
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}
