import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth-cookie';

export async function POST() {
    const out = NextResponse.json({ success: true });
    clearSessionCookie(out);
    return out;
}
