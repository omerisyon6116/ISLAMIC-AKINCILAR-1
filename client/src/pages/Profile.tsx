import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Link } from "wouter";
import { MessageCircle, Bookmark } from "lucide-react";

interface Thread {
  id: string;
  title: string;
  repliesCount: number;
  createdAt: string;
}

interface Reply {
  id: string;
  threadId: string;
  body: string;
  createdAt: string;
}

interface ProfileResponse {
  user: {
    username: string;
    displayName: string | null;
    bio: string | null;
    trustLevel: number;
    reputationPoints: number;
  };
  threads: Thread[];
  replies: Reply[];
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

  const profile = data?.user;
  const threads = data?.threads ?? [];
  const replies = data?.replies ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-16 space-y-8">
        {isLoading ? (
          <p className="text-muted-foreground">Yükleniyor...</p>
        ) : profile ? (
          <>
            <div className="border border-primary/30 bg-card/40 p-6">
              <p className="text-xs text-primary font-mono">PROFİL</p>
              <h1 className="text-3xl font-heading text-white">{profile.displayName || profile.username}</h1>
              <p className="text-muted-foreground text-sm mt-2">{profile.bio || "Topluluk üyesi"}</p>
              <div className="text-xs text-muted-foreground mt-3 flex gap-4">
                <span>Güven seviyesi: {profile.trustLevel}</span>
                <span>Puan: {profile.reputationPoints}</span>
              </div>
            </div>

            <section className="grid md:grid-cols-2 gap-6">
              <div className="border border-primary/20 bg-card/40 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <h2 className="text-lg font-heading text-white">Açtığı Konular</h2>
                </div>
                {threads.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Henüz konu yok.</p>
                ) : (
                  <div className="space-y-3">
                    {threads.map((thread) => (
                      <Link key={thread.id} href={tenantHref(`/forum/thread/${thread.id}`)}>
                        <div className="border border-white/10 hover:border-primary/60 p-3 cursor-pointer">
                          <p className="text-white text-sm">{thread.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {thread.repliesCount} yanıt • {new Date(thread.createdAt).toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-primary/20 bg-card/40 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-primary" />
                  <h2 className="text-lg font-heading text-white">Verdiği Yanıtlar</h2>
                </div>
                {replies.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Henüz yanıt yok.</p>
                ) : (
                  <div className="space-y-3">
                    {replies.map((reply) => (
                      <Link key={reply.id} href={tenantHref(`/forum/thread/${reply.threadId}`)}>
                        <div className="border border-white/10 hover:border-primary/60 p-3 cursor-pointer">
                          <p className="text-xs text-muted-foreground mb-1">
                            {new Date(reply.createdAt).toLocaleDateString("tr-TR")}
                          </p>
                          <p className="text-white text-sm line-clamp-2">{reply.body}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <p className="text-destructive">Profil bulunamadı.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
