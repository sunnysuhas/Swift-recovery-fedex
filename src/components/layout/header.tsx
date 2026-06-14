'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BarChart3, FileText, Home, Settings, ShieldCheck, Upload, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/components/providers/local-auth-provider';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import React from 'react';


const menuItems = [
  { href: '/', label: 'Recovery Command Center', icon: Home },
  { href: '/cases', label: 'Recovery Portfolio', icon: FileText },
  { href: '/dca', label: 'Agency Operations Hub', icon: ShieldCheck },
  { href: '/reports', label: 'Executive Intelligence', icon: BarChart3 },
  { href: '/import', label: 'Portfolio Ingestion Center', icon: Upload },
];

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-1');

export default function AppHeader() {
  const pathname = usePathname();
  const { user, loading: isUserLoading, logout } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = React.useState(searchParams.get('q') || '');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchValue) {
      params.set('q', searchValue);
    } else {
      params.delete('q');
    }
    // Always navigate to the cases page for a new search
    router.push(`/cases?${params.toString()}`);
  };

  React.useEffect(() => {
    setSearchValue(searchParams.get('q') || '');
  }, [searchParams]);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/85 backdrop-blur-md px-4 md:px-6 shadow-sm">
      <Link href="/" className="flex items-center gap-2 font-semibold group shrink-0 whitespace-nowrap mr-4">
        <Logo className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-200" />
        <span className="text-lg tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold">RecoveryOS</span>
        <span className="hidden lg:inline text-[10px] font-medium tracking-wider uppercase text-muted-foreground border-l pl-2.5 ml-0.5 border-border/60">Enterprise Recovery Intelligence Platform</span>
      </Link>
      <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium ml-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-2.5 py-1.5 rounded-md transition-all duration-150 font-medium whitespace-nowrap',
                isActive
                  ? 'bg-accent/60 text-foreground'
                  : 'text-muted-foreground hover:bg-accent/20 hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form onSubmit={handleSearch} className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cases by debtor..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </form>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              {isUserLoading ? (
                <Skeleton className="h-8 w-8 rounded-full" />
              ) : (
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.photoURL || userAvatar?.imageUrl}
                    alt="User avatar"
                    data-ai-hint={userAvatar?.imageHint}
                  />
                  <AvatarFallback>
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {isUserLoading ? (
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ) : (
                <>
                  <p className="font-medium text-sm leading-none">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-none mt-1">
                    {user?.email || ''}
                  </p>
                </>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/support">Support</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
