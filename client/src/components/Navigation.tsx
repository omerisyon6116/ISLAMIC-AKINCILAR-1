import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Terminal, LogOut, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/lib/site-content";
import { useAuth } from "@/lib/auth";
import { tenantBasePath, tenantHref } from "@/lib/tenant";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { content } = useSiteContent();
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const notificationsQuery = useQuery<{ notifications: any[] }>({
    queryKey: ["notifications", apiBasePath],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/notifications`, { credentials: "include" });
      if (!res.ok) throw new Error("Bildirimler alınamadı");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const unreadCount = notificationsQuery.data?.notifications.filter((n) => !n.isRead).length ?? 0;

  const markReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `${apiBasePath}/notifications/read`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", apiBasePath] });
    },
  });

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
    { name: "KİMLİK", href: "#about" },
    { name: "GÖREVLER", href: "#activities" },
    { name: "SAHA NOTLARI", href: "#blog" },
    { name: "VERİTABANI", href: "#knowledge" },
    { name: "DURUŞ", href: "#energy" },
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
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-6 py-2 text-sm font-medium font-mono text-primary/70 hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/30 transition-all clip-path-cyber"
            >
              {link.name}
            </a>
          ))}
          
          {isAuthenticated && (user?.role === "superadmin" || user?.role === "admin" || user?.role === "moderator") && (
            <Link
              href={tenantHref("/admin")}
              className="px-5 py-2 text-xs font-mono tracking-widest text-secondary border border-secondary/40 hover:border-secondary hover:bg-secondary/10 transition-all clip-path-cyber"
            >
              ADMIN PANEL
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2 ml-4 relative">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setShowNotifications((prev) => !prev)}
                  aria-label="Bildirimler"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-[10px] bg-secondary text-black rounded-full px-1">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-black/90 border border-primary/30 shadow-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono text-muted-foreground">Bildirimler</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => markReadMutation.mutate()}
                        disabled={markReadMutation.isLoading || unreadCount === 0}
                      >
                        Hepsini okundu say
                      </Button>
                    </div>
                    {notificationsQuery.isLoading ? (
                      <p className="text-sm text-muted-foreground">Yükleniyor...</p>
                    ) : (notificationsQuery.data?.notifications ?? []).slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className="border border-primary/10 p-2 text-sm text-muted-foreground"
                      >
                        <p className="text-white">{notification.payload?.message ?? notification.type}</p>
                        <p className="text-[10px] text-primary/70">
                          {new Date(notification.createdAt).toLocaleString("tr-TR")}
                        </p>
                      </div>
                    ))}
                    {(notificationsQuery.data?.notifications ?? []).length === 0 && !notificationsQuery.isLoading && (
                      <p className="text-sm text-muted-foreground">Henüz bildirimin yok.</p>
                    )}
                  </div>
                )}
              </div>
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />
                {user?.displayName || user?.username}
              </span>
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
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-lg font-mono text-primary/80 hover:text-white hover:bg-primary/20 p-4 border-l-2 border-transparent hover:border-primary transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {">"} {link.name}
            </a>
          ))}
          
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
