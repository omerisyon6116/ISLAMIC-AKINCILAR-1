import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
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
