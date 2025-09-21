'use client';
import { usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const getPageTitle = (pathname: string) => {
  if (pathname === '/') return 'Scan Image';
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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6 lg:hidden">
      <Link href="/" className="flex items-center gap-2 font-semibold text-md">
        <ShieldCheck className="w-6 h-6 text-primary"/>
        <span className="sr-only">Copyright Sentry</span>
      </Link>
      <h1 className="text-lg font-semibold sm:text-xl ml-auto">{title}</h1>
    </header>
  );
}
