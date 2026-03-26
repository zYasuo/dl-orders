'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getMe } from '@/modules/users/api';

export function useSession() {
    return useQuery({
        queryKey: queryKeys.users.me,
        queryFn: getMe,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });
}
