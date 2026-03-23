import { AppShell } from '@/components/layout/app-shell';

export default function ProductsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <AppShell>{children}</AppShell>;
}
