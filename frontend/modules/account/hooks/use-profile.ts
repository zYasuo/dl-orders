'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/modules/users/query-keys';
import { getMe, updateMe } from '@/modules/users/api';

export function useProfile() {
    return useQuery({
        queryKey: userKeys.me,
        queryFn: getMe,
        retry: false,
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (body: { name?: string | null }) => updateMe(body),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: userKeys.me });
        },
    });
}
