'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { UserProfile } from '@/types/user';

function initialsFromUser(user: UserProfile): string {
    const name = user.name?.trim();
    if (name) {
        const parts = name.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return `${parts[0]![0]!}${parts[parts.length - 1]![0]!}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }
    return user.email.slice(0, 2).toUpperCase();
}

export function AccountUserIdentity({ user }: { user: UserProfile }) {
    const displayName = user.name?.trim() || 'Account';

    return (
        <div className="border-b border-border pb-6">
            <div className="flex min-w-0 items-center gap-4">
                <Avatar className="size-14 shrink-0 border border-border sm:size-16">
                    <AvatarFallback className="bg-muted text-sm font-medium text-foreground sm:text-base">
                        {initialsFromUser(user)}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 space-y-1">
                    <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">{displayName}</h1>
                    <p className="truncate text-[13px] text-muted-foreground">{user.email}</p>
                </div>
            </div>
        </div>
    );
}
