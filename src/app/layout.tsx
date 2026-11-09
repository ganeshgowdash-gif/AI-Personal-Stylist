import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'AI Personal Stylist – Smart Wardrobe & Fashion Assistant',
  description: 'Production-ready AI wardrobe curator, outfit recommendation engine, virtual human model preview, and smart shopping assistant.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-luxury-950 text-foreground min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

