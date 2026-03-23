'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getMeService } from '@/services/users.service';

export function useSession() {
    return useQuery({
        queryKey: queryKeys.users.me,
        queryFn: getMeService,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });
}
