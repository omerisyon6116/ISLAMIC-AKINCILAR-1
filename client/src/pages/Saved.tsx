import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface SavedThread {
  id: string;
  title: string;
  repliesCount: number;
}

interface SavedPost {
  id: string;
  title: string;
  slug: string;
}

export default function Saved() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ threads: SavedThread[]; posts: SavedPost[] }>({
    queryKey: ["saved"],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/saved`, { credentials: "include" });
      if (!res.ok) throw new Error("Kayıtlar alınamadı");
      return res.json();
    },
  });

  const threads = data?.threads ?? [];
  const posts = data?.posts ?? [];

  const removeSaved = async (targetType: "thread" | "post", targetId: string) => {
    await fetch(`${apiBasePath}/saved`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ targetType, targetId }),
    });
    queryClient.invalidateQueries({ queryKey: ["saved"] });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-16 space-y-8">
        <header>
          <p className="text-sm font-mono text-primary">KAYITLI İÇERİKLER</p>
          <h1 className="text-3xl font-heading text-white">Daha sonra oku</h1>
          <p className="text-muted-foreground text-sm">Kaydettiğin konu ve yazıları burada bulabilirsin.</p>
        </header>

        {isLoading && <div className="text-muted-foreground">Yükleniyor...</div>}

        <section className="space-y-4">
          <h2 className="text-xl font-heading text-white">Konular</h2>
          <div className="space-y-3">
            {threads.map((thread) => (
              <div key={thread.id} className="border border-primary/20 bg-card/40 p-4 flex items-center justify-between">
                <div>
                  <p className="text-white">{thread.title}</p>
                  <p className="text-xs text-muted-foreground">{thread.repliesCount} yanıt</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={tenantHref(`/forum/thread/${thread.id}`)}
                    className="text-xs text-primary border border-primary/30 px-3 py-1 hover:border-primary hover:bg-primary/10 clip-path-cyber"
                  >
                    AÇ
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => removeSaved("thread", thread.id)}
                  >
                    Kaldır
                  </Button>
                </div>
              </div>
            ))}
            {!isLoading && threads.length === 0 && (
              <p className="text-muted-foreground text-sm">Henüz kaydedilmiş konu yok.</p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-heading text-white">Yazılar</h2>
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="border border-primary/20 bg-card/40 p-4 flex items-center justify-between">
                <div>
                  <p className="text-white">{post.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={tenantHref(`/posts/${post.slug ?? post.id}`)}
                    className="text-xs text-primary border border-primary/30 px-3 py-1 hover:border-primary hover:bg-primary/10 clip-path-cyber"
                  >
                    AÇ
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => removeSaved("post", post.id)}
                  >
                    Kaldır
                  </Button>
                </div>
              </div>
            ))}
            {!isLoading && posts.length === 0 && (
              <p className="text-muted-foreground text-sm">Henüz kaydedilmiş yazı yok.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
