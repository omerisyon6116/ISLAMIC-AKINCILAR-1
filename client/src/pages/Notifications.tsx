import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useNotifications } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Link } from "wouter";

export default function NotificationsPage() {
  const { notifications, isLoading } = useNotifications();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiBasePath}/notifications/read`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Bildirimler güncellenemedi");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", apiBasePath] });
    },
  });

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, ArrowRight } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  payload: Record<string, any>;
  isRead: boolean;
  createdAt: string;
};

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ notifications: Notification[] }>({
    queryKey: ["notifications", apiBasePath, "page"],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/notifications`, { credentials: "include" });
      if (res.status === 401) return { notifications: [] } as { notifications: Notification[] };
      if (!res.ok) throw new Error("Bildirimler yüklenemedi");
      return res.json();
    },
    refetchInterval: 15000,
  });

  const notifications = data?.notifications ?? [];

  const markRead = async () => {
    const res = await fetch(`${apiBasePath}/notifications/read`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["notifications", apiBasePath] });
      queryClient.invalidateQueries({ queryKey: ["notifications", apiBasePath, "page"] });
    }
  };

  const resolveLink = (notification: Notification) => {
    if (notification.type === "reply" && notification.payload?.threadId) {
      return tenantHref(`/forum/thread/${notification.payload.threadId}`);
    }
    if (notification.type === "mod_action" && notification.payload?.threadId) {
      return tenantHref(`/forum/thread/${notification.payload.threadId}`);
    }
    if (notification.payload?.postSlug) {
      return tenantHref(`/posts/${notification.payload.postSlug}`);
    }
    return tenantHref("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-16 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-mono text-primary">BİLDİRİMLER</p>
            <h1 className="text-3xl font-heading text-white">Güncel hareketler</h1>
          </div>
          <Button
            variant="outline"
            className="border-primary text-primary"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Tümünü okundu işaretle
          </Button>
        </div>

        {isLoading && <p className="text-muted-foreground">Yükleniyor...</p>}

        <div className="space-y-3">
          {notifications.map((notification) => {
            const payload = notification.payload || {};
            const link =
              payload.threadId
                ? tenantHref(`/forum/thread/${payload.threadId}`)
                : payload.postSlug
                  ? tenantHref(`/posts/${payload.postSlug}`)
                  : payload.eventId
                    ? tenantHref(`/events/${payload.eventId}`)
                    : tenantHref("/activity");

            return (
              <Link key={notification.id} href={link}>
                <div className="border border-primary/20 bg-card/40 p-4 hover:border-primary/60 cursor-pointer flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-white text-sm">{payload.message || notification.type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString("tr-TR")}</p>
                  </div>
                  {!notification.isRead && <span className="text-[10px] bg-primary text-black px-2 py-0.5">Yeni</span>}
                </div>
              </Link>
            );
          })}

          {!isLoading && notifications.length === 0 && (
            <p className="text-muted-foreground">Bildirim yok.</p>
          )}
            <h1 className="text-3xl font-heading text-white">Uyarılar ve Hareket</h1>
            <p className="text-muted-foreground">Yanıtlardan ve moderasyon aksiyonlarından haberdar olun.</p>
          </div>
          <Button onClick={markRead} variant="outline" className="border-primary/60" disabled={notifications.length === 0}>
            Okundu işaretle
          </Button>
        </div>

        {isLoading && <div className="text-muted-foreground">Yükleniyor...</div>}

        <div className="space-y-3">
          {notifications.map((notification) => (
            <Link key={notification.id} href={resolveLink(notification)}>
              <div className="border border-primary/20 bg-card/40 p-4 hover:border-primary/60 cursor-pointer flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Bell className="w-3 h-3" />
                    <span>{notification.type === "reply" ? "Yeni yanıt" : "Bildirim"}</span>
                    {!notification.isRead && <span className="text-[11px] bg-primary text-black px-2 py-0.5 rounded-full">Yeni</span>}
                  </div>
                  <p className="text-white text-sm">{notification.payload?.message || notification.type}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            </Link>
          ))}
          {!isLoading && notifications.length === 0 && <p className="text-muted-foreground">Bildirim bulunmuyor.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
