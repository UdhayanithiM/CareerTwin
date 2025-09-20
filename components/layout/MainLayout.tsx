/**
 * MainLayout Component - Redesigned
 *
 * A shared layout component for the CareerTwin platform.
 * Includes a responsive header with DYNAMIC navigation. It simplifies the UI
 * by showing minimal links based on the user's authentication state,
 * guiding new users to sign up and logged-in users to their dashboard.
 */
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu, Gauge, X, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";


export function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/'); // Redirect to homepage after logout
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* --- Site Header --- */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo and Branding */}
          <Link href="/" className="flex items-center gap-2">
            <Gauge className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">
              <span className="text-primary">Career</span>Twin
            </span>
          </Link>

          {/* Actions based on Auth State */}
          <div className="flex items-center gap-4">
            {user ? (
              // --- Logged-in User View ---
              <>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                  <Link
                      href="/dashboard"
                      className={cn(
                          "transition-colors hover:text-primary",
                          pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
                      )}
                  >
                      Dashboard
                  </Link>
                </nav>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || ''} alt={user.name || 'User'} />
                        <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // --- Logged-out User View ---
              <div className="hidden md:flex items-center gap-4">
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            )}
             <ModeToggle />
             {/* --- Mobile Menu for Logged Out --- */}
             {!user && (
                 <div className="md:hidden">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild><Button variant="outline" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
                        <SheetContent side="left">
                             <div className="mt-12 flex flex-col items-center gap-6">
                                <SheetClose asChild>
                                    <Button variant="ghost" className="w-full text-lg" asChild><Link href="/login">Login</Link></Button>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Button className="w-full text-lg" asChild><Link href="/signup">Get Started</Link></Button>
                                </SheetClose>
                             </div>
                        </SheetContent>
                    </Sheet>
                 </div>
             )}
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex-1">{children}</main>

      {/* --- Site Footer --- */}
      <footer className="py-8 border-t bg-muted/50">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            <span className="font-semibold"><span className="text-primary">Career</span>Twin</span>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} CareerTwin Inc. All rights reserved.
          </div>
          <nav className="flex gap-4">
            <Link href="#" className="text-sm hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm hover:text-primary transition-colors">Terms of Service</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}