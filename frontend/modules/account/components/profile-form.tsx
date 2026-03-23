'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { profileSchema, type ProfileFormValues } from '@/modules/account/schemas/profile.schema';
import { useProfile, useUpdateProfile } from '@/modules/account/hooks/use-profile';
import { ApiError } from '@/types/api';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileForm() {
    const { toast } = useToast();
    const { data: user, isLoading, isError, error } = useProfile();
    const updateProfile = useUpdateProfile();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: '' },
    });

    useEffect(() => {
        if (user) {
            form.reset({ name: user.name ?? '' });
        }
    }, [user, form]);

    async function onSubmit(values: ProfileFormValues) {
        try {
            const trimmed = values.name.trim();
            await updateProfile.mutateAsync({ name: trimmed === '' ? null : trimmed });
            toast({ message: 'Perfil atualizado.', variant: 'success' });
        } catch (e) {
            const msg = e instanceof ApiError ? e.message : 'Não foi possível salvar.';
            toast({ message: msg, variant: 'error' });
        }
    }

    if (isLoading) {
        return <Skeleton className="h-40 w-full max-w-md" />;
    }

    if (isError || !user) {
        const msg = error instanceof ApiError ? error.message : 'Não foi possível carregar o perfil.';
        return <Alert variant="error">{msg}</Alert>;
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-md flex-col gap-4">
            <Field label="E-mail" htmlFor="profile-email">
                <Input id="profile-email" value={user.email} disabled readOnly className="bg-muted" />
            </Field>
            <Field label="Nome" htmlFor="name" error={form.formState.errors.name?.message as string | undefined}>
                <Input id="name" autoComplete="name" {...form.register('name')} />
            </Field>
            <Button type="submit" loading={form.formState.isSubmitting || updateProfile.isPending}>
                Salvar
            </Button>
        </form>
    );
}
