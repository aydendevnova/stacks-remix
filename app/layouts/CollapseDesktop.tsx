import { useState } from "react";
import { Link, useLocation } from "@remix-run/react";
import { Bitcoin, FileStack, Home, Wallet, Menu } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";

export function CollapseDesktop({ children }: React.PropsWithChildren<{}>) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: <Home />, label: "Home", href: "/" },
    { icon: <Wallet />, label: "Wallet", href: "/wallet-methods" },
    { icon: <Bitcoin />, label: "Bitcoin Methods", href: "/btc-methods" },
    { icon: <FileStack />, label: "Stacks Methods", href: "/stacks-methods" },
  ];

  const NavLinks = () => (
    <>
      {navItems.map(({ icon, label, href }) => (
        <Link
          key={href}
          to={href}
          className="text-foreground hover:text-accent"
          onClick={() => setIsOpen(false)}
        >
          <Button
            variant={location.pathname === href ? "default" : "ghost"}
            className="flex items-center gap-2 w-full justify-start"
          >
            {label}
            {icon}
          </Button>
        </Link>
      ))}
    </>
  );

  return (
    <div className="flex bg-background">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b flex items-center px-4 bg-gray-100">
          <div className="flex items-center ml-4">
            <img
              src="/sats-connect.svg"
              alt="SatsConnect"
              className="w-40 h-10 object-contain bg-black p-2"
            />
          </div>

          {/* Desktop navigation */}
          <nav className="ml-auto hidden md:flex md:space-x-1 lg:space-x-4">
            <NavLinks />
          </nav>

          {/* Mobile navigation */}
          <div className="ml-auto md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <nav className="flex flex-col space-y-4 mt-4">
                  <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
