import { NextResponse } from 'next/server';
import { authServiceSessionPaths, postAuthServiceForSession } from '@/lib/auth/auth-service-session';
import { setSessionCookie } from '@/lib/session/auth-cookie';

export async function POST(request: Request) {
    const body = await request.json();
    const result = await postAuthServiceForSession(authServiceSessionPaths.verifyOtp, body);
    if (!result.ok) {
        return new NextResponse(result.bodyText, { status: result.status, headers: { 'Content-Type': 'application/json' } });
    }
    const out = NextResponse.json({ success: true });
    setSessionCookie(out, result.accessToken);
    return out;
}
