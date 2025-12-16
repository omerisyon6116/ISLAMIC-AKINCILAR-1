import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Link } from "wouter";
import { MessageCircle, ArrowRight } from "lucide-react";

interface ProfileResponse {
  user: { id: string; username: string; displayName?: string | null; bio?: string | null };
  threads: { id: string; title: string; createdAt: string; category?: { name: string } | null; repliesCount: number }[];
  replies: { id: string; body: string; createdAt: string; thread?: { id: string; title: string } | null }[];
}

export default function Profile({ username }: { username: string }) {
  const { data, isLoading } = useQuery<ProfileResponse>({
    queryKey: ["profile", username, apiBasePath],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/users/${username}/profile`);
      if (!res.ok) throw new Error("Profil bulunamadı");
      return res.json();
    },
  });

  const user = data?.user;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-16 space-y-8">
        {isLoading && <p className="text-muted-foreground">Yükleniyor...</p>}

        {user && (
          <header className="space-y-2">
            <p className="text-sm font-mono text-primary">PROFİL</p>
            <h1 className="text-3xl font-heading text-white">{user.displayName || user.username}</h1>
            {user.bio && <p className="text-muted-foreground max-w-2xl">{user.bio}</p>}
          </header>
        )}

        <section className="grid md:grid-cols-2 gap-6">
          <div className="border border-primary/20 bg-card/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading text-white">Açtığı Konular</h2>
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            {data?.threads?.length ? (
              <div className="space-y-2">
                {data.threads.map((thread) => (
                  <Link key={thread.id} href={tenantHref(`/forum/thread/${thread.id}`)}>
                    <div className="border border-primary/10 p-3 hover:border-primary/50 cursor-pointer">
                      <p className="text-white text-sm">{thread.title}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                        {thread.category?.name || "Kategori"} • {thread.repliesCount} yanıt •
                        {" "}
                        {new Date(thread.createdAt).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Henüz konu açmadı.</p>
            )}
          </div>

          <div className="border border-primary/20 bg-card/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading text-white">Yanıtları</h2>
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
            {data?.replies?.length ? (
              <div className="space-y-2">
                {data.replies.map((reply) => (
                  <Link key={reply.id} href={tenantHref(`/forum/thread/${reply.thread?.id}`)}>
                    <div className="border border-primary/10 p-3 hover:border-primary/50 cursor-pointer">
                      <p className="text-white text-sm line-clamp-2">{reply.body}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {reply.thread?.title || "Konu"} • {new Date(reply.createdAt).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Henüz yanıt bırakmadı.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
