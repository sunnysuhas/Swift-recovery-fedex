import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { SidebarTrigger } from '../ui/sidebar';

type AppHeaderProps = {
  title: string;
};

export default function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-card px-6">
       <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        <h1 className="font-semibold text-lg">{title}</h1>
      </div>
      <div className="flex flex-1 items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cases..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background"
            />
          </div>
        </form>
        <ThemeToggle />
      </div>
    </header>
  );
}
