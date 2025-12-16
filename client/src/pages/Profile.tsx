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
import { MessageCircle, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

type ProfileResponse = {
  user: {
    id: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    role: string;
    createdAt: string;
  };
  threads: { id: string; title: string; createdAt: string; category?: { id: string; name: string } | null }[];
  replies: { id: string; body: string; createdAt: string; thread: { id: string; title: string } }[];
};

export default function Profile({ username }: { username: string }) {
  const { user: currentUser } = useAuth();
  const { data, isLoading } = useQuery<ProfileResponse>({
    queryKey: ["profile", username, apiBasePath],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/profiles/${username}`);
      if (!res.ok) throw new Error("Profil alınamadı");
      return res.json();
    },
  });

  const profile = data?.user;
  const user = data?.user;
  const profile = data?.user;
  const threads = data?.threads ?? [];
  const replies = data?.replies ?? [];

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
        {isLoading && <div className="text-muted-foreground">Yükleniyor...</div>}

        {profile && (
          <header className="space-y-2 border border-primary/30 bg-card/40 p-5">
            <div className="flex items-center gap-3 text-primary">
              <User className="w-5 h-5" />
              <p className="text-sm font-mono">@{profile.username}</p>
            </div>
            <h1 className="text-3xl font-heading text-white">{profile.displayName || profile.username}</h1>
            <p className="text-muted-foreground text-sm">{profile.bio || ""}</p>
            <p className="text-xs text-muted-foreground">Üyelik: {new Date(profile.createdAt).toLocaleDateString("tr-TR")}</p>
            {currentUser?.username === profile.username && (
              <div className="flex gap-3 pt-3">
                <Button asChild variant="outline" className="border-primary/60">
                  <Link href={tenantHref("/saved")}>Kaydedilenler</Link>
                </Button>
                <Button asChild variant="outline" className="border-primary/60">
                  <Link href={tenantHref("/notifications")}>Bildirimler</Link>
                </Button>
              </div>
            )}
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
            <h2 className="text-xl font-heading text-white">Açılan Konular</h2>
          </div>
          {threads.map((thread) => (
            <Link key={thread.id} href={tenantHref(`/forum/thread/${thread.id}`)}>
              <div className="border border-primary/20 bg-card/40 p-4 hover:border-primary/60 cursor-pointer flex items-center justify-between">
                <div>
                  <p className="text-white">{thread.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {thread.category?.name} • {new Date(thread.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
            </Link>
          ))}
          {!isLoading && threads.length === 0 && <p className="text-muted-foreground">Henüz konu açılmamış.</p>}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading text-white">Yanıtlar</h2>
          </div>
          {replies.map((reply) => (
            <Link key={reply.id} href={tenantHref(`/forum/thread/${reply.thread.id}`)}>
              <div className="border border-primary/20 bg-card/40 p-4 hover:border-primary/60 cursor-pointer">
                <p className="text-white text-sm mb-1">{reply.thread.title}</p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{reply.body}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {new Date(reply.createdAt).toLocaleString("tr-TR")}
                </p>
              </div>
            </Link>
          ))}
          {!isLoading && replies.length === 0 && <p className="text-muted-foreground">Henüz yanıt yok.</p>}
        </section>
      </main>
      <Footer />
    </div>
  );
}
