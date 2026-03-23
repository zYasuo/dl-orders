import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';
import { SiteHeader } from '@/components/layout/site-header';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'dl-orders',
    description: 'Catálogo e pedidos — dl-orders',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
            <body className="flex min-h-full flex-col bg-background text-foreground">
                <AppProviders>
                    <SiteHeader />
                    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">{children}</main>
                </AppProviders>
            </body>
        </html>
    );
}
