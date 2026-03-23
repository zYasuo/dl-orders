import { AppShell } from '@/components/layout/app-shell';

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <AppShell>{children}</AppShell>;
}
