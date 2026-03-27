'use client';

import { useQuery } from '@tanstack/react-query';
import { userKeys } from '@/modules/users/query-keys';
import { getMe } from '@/modules/users/api';

export function useSession() {
    return useQuery({
        queryKey: userKeys.me,
        queryFn: getMe,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });
}
