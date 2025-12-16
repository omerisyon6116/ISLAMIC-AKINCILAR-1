import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";

interface SavedItem {
  targetType: "thread" | "post";
  targetId: string;
  title: string;
}

export default function Saved() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useQuery<{ saved: SavedItem[] }>({
    queryKey: ["saved", apiBasePath],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/saved`, { credentials: "include" });
      if (!res.ok) throw new Error("Kayıtlı içerikler alınamadı");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const mutation = useMutation({
    mutationFn: async (item: SavedItem) => {
      await fetch(`${apiBasePath}/saved`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: item.targetType, targetId: item.targetId }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved", apiBasePath] }),
  });

  const saved = data?.saved ?? [];
import { useQuery } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Link } from "wouter";
import { Bookmark } from "lucide-react";

type SavedThread = {
  id: string;
  title: string;
  category?: { id: string; name: string } | null;
  createdAt: string;
};

export default function Saved() {
  const { data, isLoading } = useQuery<{ threads: SavedThread[] }>({
    queryKey: ["saved", apiBasePath],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/forum/saved`, { credentials: "include" });
      if (!res.ok) throw new Error("Kaydedilenler yüklenemedi");
      return res.json();
    },
  });

  const threads = data?.threads ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-16 space-y-6">
        <div>
          <p className="text-sm font-mono text-primary">KAYDEDİLENLER</p>
          <h1 className="text-3xl font-heading text-white">Daha sonra oku</h1>
        </div>

        {!isAuthenticated && <p className="text-muted-foreground">Kayıtlı içerikleri görmek için giriş yapın.</p>}

        {isLoading && isAuthenticated && <p className="text-muted-foreground">Yükleniyor...</p>}

        <div className="space-y-3">
          {saved.map((item) => (
            <div key={`${item.targetType}-${item.targetId}`} className="border border-primary/20 bg-card/40 p-4 flex items-center justify-between">
              <Link href={tenantHref(item.targetType === "thread" ? `/forum/thread/${item.targetId}` : `/posts/${item.targetId}`)}>
                <div className="space-y-1 cursor-pointer">
                  <p className="text-white text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.targetType === "thread" ? "Konu" : "Yazı"}</p>
                </div>
              </Link>
              <Button variant="ghost" className="text-destructive" onClick={() => mutation.mutate(item)}>
                Kaldır
              </Button>
            </div>
          ))}

          {!isLoading && isAuthenticated && saved.length === 0 && <p className="text-muted-foreground">Henüz kayıtlı içeriğiniz yok.</p>}
        <div className="space-y-2">
          <p className="text-sm font-mono text-primary">KAYDEDİLENLER</p>
          <h1 className="text-3xl font-heading text-white">Okuma Listesi</h1>
          <p className="text-muted-foreground">Sonradan dönmek istediğiniz konular burada.</p>
        </div>

        {isLoading && <div className="text-muted-foreground">Yükleniyor...</div>}

        <div className="space-y-3">
          {threads.map((thread) => (
            <Link key={thread.id} href={tenantHref(`/forum/thread/${thread.id}`)}>
              <div className="border border-primary/20 bg-card/40 p-4 hover:border-primary/60 cursor-pointer flex items-center justify-between">
                <div>
                  <p className="text-white">{thread.title}</p>
                  <p className="text-xs text-muted-foreground">{thread.category?.name}</p>
                </div>
                <Bookmark className="w-4 h-4 text-primary" />
              </div>
            </Link>
          ))}
          {!isLoading && threads.length === 0 && <p className="text-muted-foreground">Henüz kayıtlı konu yok.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
