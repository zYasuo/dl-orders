import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';
import { ConditionalSiteHeader } from '@/components/layout/conditional-site-header';

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
    description: 'Catalog and orders — dl-orders',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
            <body className="flex min-h-full flex-col bg-background text-foreground">
                <AppProviders>
                    <ConditionalSiteHeader />
                    <main className="flex min-w-0 w-full flex-1 flex-col">{children}</main>
                </AppProviders>
            </body>
        </html>
    );
}
