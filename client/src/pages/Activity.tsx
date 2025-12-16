import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Link } from "wouter";
import { ArrowRight, MessageCircle, Calendar } from "lucide-react";

type ActivityItem = {
  id: string;
  type: "thread" | "reply" | "post" | "event";
  title: string;
  refId?: string;
  createdAt: string;
};

export default function Activity() {
  const { data, isLoading } = useQuery<{ items: ActivityItem[] }>({
    queryKey: ["activity", apiBasePath],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/activity?limit=20`);
      if (!res.ok) throw new Error("Aktivite yüklenemedi");
      return res.json();
    },
  });

  const items = data?.items ?? [];

  const getLink = (item: ActivityItem) => {
    if (item.type === "thread" || item.type === "reply") return tenantHref(`/forum/thread/${item.refId || item.id}`);
    if (item.type === "post") return tenantHref(`/posts/${item.refId || item.id}`);
    if (item.type === "event") return tenantHref(`/events/${item.refId || item.id}`);
    return tenantHref("/");
  };

  const getLabel = (item: ActivityItem) => {
    switch (item.type) {
      case "thread":
        return "Yeni konu";
      case "reply":
        return "Yeni yanıt";
      case "post":
        return "Yeni yazı";
      case "event":
        return "Yeni etkinlik";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-16 space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-mono text-primary">TOPLULUK AKTİVİTESİ</p>
          <h1 className="text-3xl font-heading text-white">Akış</h1>
          <p className="text-muted-foreground">Konular, yanıtlar, yazılar ve etkinlikler tek akışta.</p>
        </div>

        {isLoading && <div className="text-muted-foreground">Yükleniyor...</div>}

        <div className="space-y-3">
          {items.map((item) => (
            <Link key={`${item.type}-${item.id}`} href={getLink(item)}>
              <div className="border border-primary/20 bg-card/40 p-4 hover:border-primary/60 cursor-pointer flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <MessageCircle className="w-3 h-3" />
                    <span>{getLabel(item)}</span>
                  </div>
                  <p className="text-white text-lg">{item.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.createdAt).toLocaleString("tr-TR")}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            </Link>
          ))}
          {!isLoading && items.length === 0 && <p className="text-muted-foreground">Henüz aktivite yok.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}

