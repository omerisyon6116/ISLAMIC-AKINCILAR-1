import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Link } from "wouter";

interface SavedItem {
  targetId: string;
  targetType: string;
}

export default function Saved() {
  const { data, isLoading } = useQuery<{ saved: SavedItem[] }>({
    queryKey: ["saved", apiBasePath],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/saved`, { credentials: "include" });
      if (!res.ok) throw new Error("Kayıtlı içerikler alınamadı");
      return res.json();
    },
  });

  const saved = data?.saved ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-16 space-y-6">
        <div>
          <p className="text-xs text-primary font-mono">KAYDEDİLENLER</p>
          <h1 className="text-3xl font-heading text-white">Okuma Listem</h1>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground">Yükleniyor...</div>
        ) : saved.length === 0 ? (
          <div className="text-muted-foreground">Henüz kaydedilen içerik yok.</div>
        ) : (
          <div className="space-y-3">
            {saved.map((item) => {
              const href =
                item.targetType === "post"
                  ? tenantHref(`/posts/${item.targetId}`)
                  : tenantHref(`/forum/thread/${item.targetId}`);
              return (
                <Link key={item.targetId} href={href}>
                  <div className="border border-primary/30 bg-card/40 p-4 hover:border-primary/60 cursor-pointer">
                    <p className="text-sm text-white">{item.targetType === "post" ? "Blog Yazısı" : "Forum Konusu"}</p>
                    <p className="text-xs text-muted-foreground">ID: {item.targetId}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
