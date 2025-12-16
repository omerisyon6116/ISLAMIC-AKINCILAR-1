import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiBasePath } from "@/lib/tenant";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: string;
  payload: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ notifications: Notification[] }>({
    queryKey: ["notifications", apiBasePath],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/notifications`, { credentials: "include" });
      if (!res.ok) throw new Error("Bildirimler alınamadı");
      return res.json();
    },
  });

  const markRead = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiBasePath}/notifications/read`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Güncellenemedi");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", apiBasePath] });
    },
  });

  const notifications = data?.notifications ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-16 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-primary font-mono">BİLDİRİMLER</p>
            <h1 className="text-3xl font-heading text-white">Topluluk Hareketleri</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => markRead.mutate()}
            disabled={markRead.isLoading || notifications.length === 0}
            className="border-primary/40 text-primary"
          >
            Tümünü Okundu İşaretle
          </Button>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground">Yükleniyor...</div>
        ) : notifications.length === 0 ? (
          <div className="text-muted-foreground">Bildirim bulunamadı.</div>
        ) : (
          <div className="space-y-4">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`border p-4 bg-card/40 ${item.isRead ? "border-white/10" : "border-primary/40"}`}
              >
                <p className="text-sm text-white font-heading">
                  {item.type === "reply"
                    ? "Konu yanıtlandı"
                    : item.type === "mod_action"
                      ? "Moderasyon işlemi"
                      : "Bildirim"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.payload?.message || "Yeni aktivite"} – {new Date(item.createdAt).toLocaleString("tr-TR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
