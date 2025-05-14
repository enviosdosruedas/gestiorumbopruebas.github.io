import { Logo } from '@/components/Logo';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        {/* Future navigation items can go here */}
      </div>
    </header>
  );
}
