import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Building2, Users, CreditCard, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isClientsPage = location.pathname === "/" || location.pathname.startsWith("/clients");
  const isSubscriptionsPage = location.pathname === "/subscriptions" || location.pathname.startsWith("/subscriptions/");
  const isReportsPage = location.pathname === "/reports";

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/95 backdrop-blur-sm">
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Building2 className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Flow Tech</h1>
            <p className="text-xs text-muted-foreground">Gestão de Clientes</p>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          <Link
            to="/"
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
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
