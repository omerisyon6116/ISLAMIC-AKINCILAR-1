import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Link } from "wouter";

interface ProfileResponse {
  user: {
    id: string;
    username: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
  };
  threads: { id: string; title: string; createdAt: string; repliesCount: number }[];
  replies: { id: string; body: string; createdAt: string; threadId: string; threadTitle: string }[];
}

export default function Profile({ username }: { username: string }) {
  const { data, isLoading } = useQuery<ProfileResponse>({
    queryKey: ["profile", username],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/profiles/${username}`);
      if (!res.ok) throw new Error("Profil bulunamadı");
      return res.json();
    },
  });

  const profile = data?.user;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-16 space-y-10">
        {isLoading && <div className="text-muted-foreground">Yükleniyor...</div>}
        {profile && (
          <header className="space-y-2">
            <p className="text-sm font-mono text-primary">ÜYE PROFİLİ</p>
            <h1 className="text-3xl font-heading text-white">{profile.displayName || profile.username}</h1>
            {profile.bio && <p className="text-muted-foreground max-w-2xl">{profile.bio}</p>}
          </header>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading text-white">Açtığı Konular</h2>
          </div>
          <div className="space-y-3">
            {data?.threads.map((thread) => (
              <Link
                key={thread.id}
                href={tenantHref(`/forum/thread/${thread.id}`)}
                className="block border border-primary/20 bg-card/40 p-4 hover:border-primary/60"
              >
                <div className="flex items-center justify-between">
                  <p className="text-white">{thread.title}</p>
                  <span className="text-xs text-primary">{thread.repliesCount} yanıt</span>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(thread.createdAt).toLocaleString("tr-TR")}</p>
              </Link>
            ))}
            {!isLoading && (data?.threads.length ?? 0) === 0 && (
              <p className="text-muted-foreground text-sm">Henüz konu açmadı.</p>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading text-white">Yanıtlar</h2>
          <div className="space-y-3">
            {data?.replies.map((reply) => (
              <Link
                key={reply.id}
                href={tenantHref(`/forum/thread/${reply.threadId}`)}
                className="block border border-primary/20 bg-card/40 p-4 hover:border-primary/60"
              >
                <p className="text-white text-sm">{reply.threadTitle}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{reply.body}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {new Date(reply.createdAt).toLocaleString("tr-TR")}
                </p>
              </Link>
            ))}
            {!isLoading && (data?.replies.length ?? 0) === 0 && (
              <p className="text-muted-foreground text-sm">Henüz yanıt bırakmadı.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
