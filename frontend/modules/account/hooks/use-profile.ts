'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getMeService, patchMeService } from '@/services/users.service';

export function useProfile() {
    return useQuery({
        queryKey: queryKeys.users.me,
        queryFn: getMeService,
        retry: false,
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: { name?: string | null }) => patchMeService(body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
        },
    });
}
