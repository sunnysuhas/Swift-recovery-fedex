'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { useUser, useAuth } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { signOut } from 'firebase/auth';


const menuItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/cases', label: 'All Cases', icon: FileText },
  { href: '/dca', label: 'DCA Portal', icon: ShieldCheck },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/import', label: 'Import Data', icon: Upload },
];

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-1');

export default function AppHeader() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Logo className="h-6 w-6" />
        <span className="">RecoveryAI</span>
      </Link>
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'transition-colors hover:text-foreground',
              pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search cases..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
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
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
