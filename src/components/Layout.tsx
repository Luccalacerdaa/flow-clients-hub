import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, CreditCard, BarChart3, Menu, LayoutDashboard, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { FlowTechLogo } from "@/components/FlowTechLogo";
import { NotificationSettings } from "@/components/NotificationSettings";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  
  const isDashboardPage = location.pathname === "/";
  const isClientsPage = location.pathname === "/clients" || location.pathname.startsWith("/clients/");
  const isSubscriptionsPage = location.pathname === "/subscriptions" || location.pathname.startsWith("/subscriptions/");
  const isReportsPage = location.pathname === "/reports";

  const NavLinks = () => (
    <>
      <Link
        to="/"
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isDashboardPage
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </Link>
      <Link
        to="/clients"
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isClientsPage
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Users className="h-4 w-4" />
        Clientes
      </Link>
      <Link
        to="/subscriptions"
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isSubscriptionsPage
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <CreditCard className="h-4 w-4" />
        Mensalidades
      </Link>
      <Link
        to="/reports"
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isReportsPage
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <BarChart3 className="h-4 w-4" />
        Relatórios
      </Link>
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-border bg-card/95 backdrop-blur-sm lg:hidden">
          <div className="flex h-full items-center justify-between px-4">
            <FlowTechLogo size="sm" />
            <div className="flex items-center gap-2">
              <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Configurações de notificação</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Configurações de Notificação</DialogTitle>
                    <DialogDescription>
                      Configure as notificações PWA para receber lembretes de pagamentos
                    </DialogDescription>
                  </DialogHeader>
                  <NotificationSettings />
                </DialogContent>
              </Dialog>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-16 items-center gap-3 border-b border-border px-6">
                  <FlowTechLogo size="sm" />
                </div>
                <nav className="p-4 space-y-1">
                  <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="hidden w-64 border-r border-border bg-card/95 backdrop-blur-sm lg:block">
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <FlowTechLogo size="sm" />
            <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Configurações de notificação</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Configurações de Notificação</DialogTitle>
                  <DialogDescription>
                    Configure as notificações PWA para receber lembretes de pagamentos
                  </DialogDescription>
                </DialogHeader>
                <NotificationSettings />
              </DialogContent>
            </Dialog>
          </div>
          <nav className="p-4 space-y-1">
            <NavLinks />
          </nav>
        </aside>
      )}

      {/* Main content */}
      <main className={cn(
        "flex-1 w-full",
        isMobile && "pt-16"
      )}>
        <div className="h-full w-full overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
