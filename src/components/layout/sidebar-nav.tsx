'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  FileText,
  Home,
  Settings,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useUser } from '@/firebase';
import { Skeleton } from '../ui/skeleton';

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-1');

export function SidebarNav() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/cases', label: 'All Cases', icon: FileText },
    { href: '/dca', label: 'DCA Portal', icon: ShieldCheck },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/import', label: 'Import Data', icon: Upload },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8 shrink-0" />
          <div className="flex flex-col">
            <h2 className="text-base font-semibold">RecoveryAI</h2>
            <p className="text-xs text-muted-foreground">FedEx Edition</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="justify-start w-full h-12 p-2 group">
              <div className="flex items-center gap-3 w-full">
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
                      {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="text-left hidden group-data-[collapsible=icon]:hidden">
                  {isUserLoading ? (
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-sm">
                        {user?.displayName || 'Anonymous User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email || 'anon@fedex.com'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
