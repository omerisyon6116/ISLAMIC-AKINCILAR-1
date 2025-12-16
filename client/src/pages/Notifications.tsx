import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface NotificationItem {
  id: string;
  type: string;
  payload: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ notifications: NotificationItem[] }>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/notifications`, { credentials: "include" });
      if (!res.ok) throw new Error("Bildirimler alınamadı");
      return res.json();
    },
  });

  const notifications = data?.notifications ?? [];
  const unread = notifications.filter((n) => !n.isRead).length;

  const markRead = async () => {
    await fetch(`${apiBasePath}/notifications/read`, { method: "POST", credentials: "include" });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notifications", "nav"] });
  };

  const renderLink = (item: NotificationItem) => {
    if (item.payload?.threadId) {
      return tenantHref(`/forum/thread/${item.payload.threadId}`);
    }
    if (item.payload?.postSlug) {
      return tenantHref(`/posts/${item.payload.postSlug}`);
    }
    if (item.payload?.eventId) {
      return tenantHref(`/events/${item.payload.eventId}`);
    }
    return undefined;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-16 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-mono text-primary">BİLDİRİMLER</p>
            <h1 className="text-3xl font-heading text-white">Haberdar ol</h1>
            <p className="text-muted-foreground text-sm">Yeni yanıt ve hareketleri buradan takip et.</p>
          </div>
          <Button onClick={markRead} disabled={unread === 0} className="bg-primary text-black">
            Tümünü okundu işaretle
          </Button>
        </div>

        {isLoading && <div className="text-muted-foreground">Yükleniyor...</div>}

        <div className="space-y-3">
          {notifications.map((item) => {
            const href = renderLink(item);
            return (
              <div
                key={item.id}
                className="border border-primary/20 bg-card/40 p-4 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm text-white">
                    {item.type === "reply"
                      ? "Konuya yanıt geldi"
                      : item.type === "mod_action"
                      ? "Moderasyon bildirimi"
                      : "Bildirim"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
                {href ? (
                  <Link
                    href={href}
                    className="text-xs text-primary border border-primary/30 px-3 py-1 hover:border-primary hover:bg-primary/10 clip-path-cyber"
                  >
                    GİT
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground">İşlem</span>
                )}
              </div>
            );
          })}
          {!isLoading && notifications.length === 0 && (
            <p className="text-muted-foreground">Bildirim bulunamadı.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
