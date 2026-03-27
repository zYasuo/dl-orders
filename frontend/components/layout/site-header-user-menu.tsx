'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/modules/auth/api';
import { queryKeys } from '@/lib/query-keys';
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

export function SiteHeaderUserMenu({ user }: { user: UserProfile }) {
    const router = useRouter();
    const queryClient = useQueryClient();

    async function handleSignout() {
        try {
            await signOut();
            await queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
            router.push('/products');
            router.refresh();
        } catch {}
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Open account menu"
            >
                <Avatar className="size-8 border border-border">
                    <AvatarFallback className="bg-muted text-[11px] font-medium text-foreground">{initialsFromUser(user)}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-0.5">
                        {user.name ? <span className="truncate text-sm font-medium text-foreground">{user.name}</span> : null}
                        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/account">Account</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-danger focus:bg-danger/10 focus:text-danger"
                    onSelect={() => void handleSignout()}
                >
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
