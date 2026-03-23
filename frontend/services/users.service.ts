import { bffJson } from '@/lib/api-client';
import type { UserProfile } from '@/types/user';

export async function getMeService() {
    return bffJson<UserProfile>('/api/users/me');
}

export async function patchMeService(body: { name?: string | null }) {
    return bffJson<UserProfile>('/api/users/me', { method: 'PATCH', body: JSON.stringify(body) });
}
