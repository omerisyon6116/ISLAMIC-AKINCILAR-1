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
        </div>
      </main>
      <Footer />
    </div>
  );
}
