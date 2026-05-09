import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Hotel } from "lucide-react";

const NAV = [
  { to: "/", label: "首页" },
  { to: "/booking", label: "预定客房" },
  { to: "/orders", label: "订单查询" },
  { to: "/checkin", label: "办理入住" },
] as const;

export function SiteLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2">
            <Hotel className="h-6 w-6 text-gold" />
            <span className="font-display text-xl font-semibold">华住酒店集团</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-4 py-2 rounded-md text-sm transition-colors ${
                    active
                      ? "text-gold font-medium"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <Link
            to="/booking"
            className="hidden md:inline-flex items-center px-4 py-2 rounded-md bg-gold-gradient text-primary text-sm font-medium shadow-card hover:opacity-90 transition"
          >
            立即预定
          </Link>
        </div>
        <nav className="md:hidden flex justify-around border-t py-2 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={pathname === n.to ? "text-gold font-medium" : "text-muted-foreground"}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t bg-primary text-primary-foreground/80 mt-16">
        <div className="container mx-auto px-6 py-8 text-sm flex flex-col md:flex-row justify-between gap-2">
          <p className="font-display text-base">华住酒店集团 · Huazhu Hotels Group</p>
          <p>24h 礼宾热线：400-XXX-XXXX · © 2026 All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
