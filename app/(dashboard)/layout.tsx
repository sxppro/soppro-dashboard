import MainNav from '@/components/core/main-nav';
import MobileNav from '@/components/core/mobile-nav';
import PageProgressBar from '@/components/core/page-progress-bar';
import ThemeToggle from '@/components/core/theme-toggle';
import UserNav from '@/components/core/user-nav';
import QueryProvider from '@/components/providers/query-provider';
import { getCurrentUser } from '@/utils/auth';
import { Flex } from '@tremor/react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <QueryProvider>
      <PageProgressBar />
      <div className="border-b">
        <div className="max-w-screen-2xl m-auto flex h-16 items-center px-4 md:px-8">
          <MainNav className="hidden sm:flex items-center space-x-4 lg:space-x-6" />
          <MobileNav className="sm:hidden" />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
            <UserNav user={user} />
          </div>
        </div>
      </div>
      <main className="max-w-screen-2xl m-auto py-4 px-4 md:px-8">
        <Flex className="gap-2" flexDirection="col" alignItems="start">
          {children}
        </Flex>
      </main>
    </QueryProvider>
  );
}
