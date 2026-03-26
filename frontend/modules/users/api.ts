import { bffJson } from '@/lib/api-client';
import type { UserProfile } from '@/types/user';

export async function getMe() {
    return bffJson<UserProfile>('/api/users/me');
}

export async function updateMe(body: { name?: string | null }) {
    return bffJson<UserProfile>('/api/users/me', { method: 'PATCH', body: JSON.stringify(body) });
}
