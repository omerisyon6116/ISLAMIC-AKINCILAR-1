import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Terminal, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/lib/site-content";
import { useAuth } from "@/lib/auth";
import { tenantBasePath, tenantHref, apiBasePath } from "@/lib/tenant";
import { useQuery } from "@tanstack/react-query";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { content } = useSiteContent();
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const { data: notificationsData } = useQuery<{ notifications: { id: string; isRead: boolean }[] }>({
    queryKey: ["notifications", "nav"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/notifications`, { credentials: "include" });
      if (!res.ok) throw new Error("Bildirimler alınamadı");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const unreadCount = notificationsData?.notifications.filter((n) => !n.isRead).length ?? 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setLocation(tenantBasePath);
  };

  const navLinks = [
    { name: "FORUM", href: tenantHref("/forum"), type: "route" as const },
    { name: "KİMLİK", href: "#about", type: "anchor" as const },
    { name: "GÖREVLER", href: "#activities", type: "anchor" as const },
    { name: "SAHA NOTLARI", href: "#blog", type: "anchor" as const },
    { name: "VERİTABANI", href: "#knowledge", type: "anchor" as const },
    { name: "DURUŞ", href: "#energy", type: "anchor" as const },
    { name: "AKIŞ", href: tenantHref("/activity"), type: "route" as const },
    { name: "BİLDİRİMLER", href: tenantHref("/notifications"), type: "route" as const, badge: unreadCount },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-primary/30 py-3 shadow-[0_5px_30px_rgba(0,243,255,0.1)]"
          : "bg-transparent border-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href={tenantHref("/")} className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary/20 border border-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold font-heading tracking-widest text-foreground group-hover:text-glow transition-all">
            AKINCILAR
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) =>
            link.type === "route" ? (
              <Link
                key={link.name}
                href={link.href}
                className="px-6 py-2 text-sm font-medium font-mono text-primary/70 hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/30 transition-all clip-path-cyber"
              >
                <span className="flex items-center gap-2">
                  {link.name}
                  {link.badge && link.badge > 0 && (
                    <span className="text-[10px] px-2 py-0.5 bg-primary text-black font-bold">{link.badge}</span>
                  )}
                </span>
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                className="px-6 py-2 text-sm font-medium font-mono text-primary/70 hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/30 transition-all clip-path-cyber"
              >
                {link.name}
              </a>
            ),
          )}
          
          {isAuthenticated && (user?.role === "superadmin" || user?.role === "admin" || user?.role === "moderator") && (
            <Link
              href={tenantHref("/admin")}
              className="px-5 py-2 text-xs font-mono tracking-widest text-secondary border border-secondary/40 hover:border-secondary hover:bg-secondary/10 transition-all clip-path-cyber"
            >
              ADMIN PANEL
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2 ml-4">
              <Link
                href={tenantHref(`/u/${user?.username}`)}
                className="text-xs font-mono text-muted-foreground flex items-center gap-1 hover:text-primary"
              >
                <User className="w-3 h-3" />
                {user?.displayName || user?.username}
              </Link>
              <Link
                href={tenantHref("/saved")}
                className="px-3 py-1 text-[11px] font-mono text-primary border border-primary/20 hover:border-primary hover:bg-primary/10 transition-all clip-path-cyber"
              >
                KAYITLAR
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1 text-xs font-mono"
                data-testid="button-logout"
              >
                <LogOut className="w-3 h-3" /> ÇIKIŞ
              </Button>
            </div>
          ) : (
            <Button asChild className="ml-4 bg-secondary text-black hover:bg-white font-bold tracking-widest clip-path-cyber rounded-none border-none">
              <Link href={tenantHref("/login")} data-testid="button-login-nav">{content.navCta.label}</Link>
            </Button>
          )}
        </div>

        <button
          className="md:hidden text-primary border border-primary/30 p-2 bg-black/50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 border-b border-primary/30 p-6 flex flex-col space-y-2 animate-in slide-in-from-top-5 backdrop-blur-xl">
          {navLinks.map((link) =>
            link.type === "route" ? (
              <Link
                key={link.name}
                href={link.href}
                className="text-lg font-mono text-primary/80 hover:text-white hover:bg-primary/20 p-4 border-l-2 border-transparent hover:border-primary transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  {">"} {link.name}
                  {link.badge && link.badge > 0 && (
                    <span className="text-[10px] px-2 py-0.5 bg-primary text-black font-bold">{link.badge}</span>
                  )}
                </span>
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                className="text-lg font-mono text-primary/80 hover:text-white hover:bg-primary/20 p-4 border-l-2 border-transparent hover:border-primary transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {">"} {link.name}
              </a>
            ),
          )}
          
          {isAuthenticated && (user?.role === "superadmin" || user?.role === "admin" || user?.role === "moderator") && (
            <Link
              href={tenantHref("/admin")}
              className="text-lg font-mono text-secondary hover:text-white hover:bg-secondary/20 p-4 border-l-2 border-transparent hover:border-secondary transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {">"} ADMIN PANEL
            </Link>
          )}

          {isAuthenticated ? (
            <div className="pt-4 space-y-2">
              <p className="text-xs font-mono text-muted-foreground px-4">
                Giriş yapan: {user?.displayName || user?.username}
              </p>
              <div className="flex flex-col gap-2 px-4">
                <Link
                  href={tenantHref(`/u/${user?.username}`)}
                  className="text-sm font-mono text-primary hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profilim
                </Link>
                <Link
                  href={tenantHref("/saved")}
                  className="text-sm font-mono text-primary hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Kaydedilenler
                </Link>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-lg font-mono text-destructive hover:text-white hover:bg-destructive/20 p-4 border-l-2 border-transparent hover:border-destructive transition-all text-left"
                data-testid="button-mobile-logout"
              >
                {">"} ÇIKIŞ YAP
              </button>
            </div>
          ) : (
            <Button asChild className="w-full mt-4 bg-secondary text-black font-bold font-heading tracking-widest rounded-none">
              <Link href={tenantHref("/login")} onClick={() => setIsMobileMenuOpen(false)}>{content.navCta.label}</Link>
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
