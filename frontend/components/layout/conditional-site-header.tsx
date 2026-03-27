'use client';

import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';

const AUTH_PREFIX = '/auth';

export function ConditionalSiteHeader() {
    const pathname = usePathname();

    if (pathname === AUTH_PREFIX || pathname?.startsWith(`${AUTH_PREFIX}/`)) {
        return null;
    }

    return <SiteHeader />;
}
