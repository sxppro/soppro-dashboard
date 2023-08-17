import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Up Dashboard',
  description: 'Smart transaction analysis by Soppro',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          footer: 'hidden',
          card: 'bg-tremor-background dark:bg-dark-tremor-background',
          headerTitle:
            'text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis',
          headerSubtitle: 'text-tremor-content dark:text-dark-tremor-content',
          socialButtonsBlockButton:
            'dark:bg-dark-tremor-background-emphasis dark:hover:bg-gray-400',
        },
      }}
    >
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
