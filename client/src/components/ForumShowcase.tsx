import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { ArrowRight, MessageCircle, Eye } from "lucide-react";

interface ThreadItem {
  id: string;
  title: string;
  repliesCount: number;
  viewsCount: number;
  createdAt: string;
  author?: { displayName?: string | null; username: string };
}

interface HighlightResponse {
  newThreads: ThreadItem[];
  mostReplied: ThreadItem[];
  mostViewed: ThreadItem[];
}

export default function ForumShowcase() {
  const { data, isLoading } = useQuery<HighlightResponse>({
    queryKey: ["forum", "highlights"],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/forum/highlights`);
      if (!res.ok) throw new Error("Forum vitrin yüklenemedi");
      return res.json();
    },
  });

  const renderList = (threads: ThreadItem[] = [], empty: string) => {
    if (isLoading) return <p className="text-sm text-muted-foreground">Yükleniyor...</p>;
    if (threads.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
    return (
      <div className="space-y-2">
        {threads.map((thread) => (
          <Link key={thread.id} href={tenantHref(`/forum/thread/${thread.id}`)}>
            <div className="border border-primary/20 bg-card/40 p-3 hover:border-primary/60 cursor-pointer flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-white text-sm leading-tight">{thread.title}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                  <MessageCircle className="w-3 h-3" /> {thread.repliesCount} yanıt
                  <Eye className="w-3 h-3" /> {thread.viewsCount}
                  <span>
                    {thread.author?.displayName || thread.author?.username} • {new Date(thread.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <section className="bg-card/30 border-y border-white/5 py-16" id="forum-showcase">
      <div className="container mx-auto px-6 space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-mono text-primary">FORUM VİTRİNİ</p>
          <h2 className="text-3xl md:text-4xl font-heading text-white">Topluluğun nabzı</h2>
          <p className="text-muted-foreground max-w-2xl">
            En yeni, en çok yanıtlanan ve en çok görüntülenen konulara anında atla.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-primary/20 bg-background/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading text-white">Yeni Konular</h3>
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
            {renderList(data?.newThreads, "Henüz konu yok")}
          </div>

          <div className="border border-primary/20 bg-background/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading text-white">En Çok Cevaplanan</h3>
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
            {renderList(data?.mostReplied, "Cevaplanan konu yok")}
          </div>

          <div className="border border-primary/20 bg-background/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading text-white">En Çok Görüntülenen</h3>
              <ArrowRight className="w-4 h-4 text-primary" />
            </div>
            {renderList(data?.mostViewed, "Popüler konu bulunamadı")}
          </div>
        </div>
      </div>
    </section>
  );
}
