'use client';
import { usePathname } from 'next/navigation';

const getPageTitle = (pathname: string) => {
  if (pathname === '/') return 'Scan';
  if (pathname.startsWith('/history')) return 'Scan History';
  if (pathname.startsWith('/scan')) return 'Scan Result';
  if (pathname.startsWith('/premium')) return 'Premium';
  if (pathname.startsWith('/settings')) return 'Settings';
  return 'Copyright Sentry';
};

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:h-16 sm:px-6 md:hidden">
      <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
    </header>
  );
}
