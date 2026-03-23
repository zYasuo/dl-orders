import { AppShell } from '@/components/layout/app-shell';

export default function OrdersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <AppShell>{children}</AppShell>;
}
