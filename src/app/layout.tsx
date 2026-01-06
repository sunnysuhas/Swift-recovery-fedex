import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { LocalAuthProvider } from '@/components/providers/local-auth-provider';
import AppLayout from '@/components/layout/app-layout';
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'RecoveryAI',
  description: 'FedEx DCA Intelligence Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          outfit.variable,
          process.env.NODE_ENV === 'development' ? 'debug-screens' : ''
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LocalAuthProvider>
            <AppLayout>{children}</AppLayout>
          </LocalAuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
