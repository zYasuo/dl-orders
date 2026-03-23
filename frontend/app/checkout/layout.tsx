import { AppShell } from '@/components/layout/app-shell';

export default function CheckoutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <AppShell>{children}</AppShell>;
}
