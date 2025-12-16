import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { ArrowRight, MessageCircle, Eye } from "lucide-react";

interface ThreadItem {
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, MessageCircle, Eye } from "lucide-react";
import { apiBasePath, tenantHref } from "@/lib/tenant";

type HighlightThread = {
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
  category?: { id: string; name: string } | null;
  author?: { username: string; displayName?: string | null } | null;
  createdAt: string;
  lastActivityAt: string;
};

type Highlights = {
  newest: HighlightThread[];
  mostAnswered: HighlightThread[];
  mostViewed: HighlightThread[];
};

function ThreadList({ title, threads }: { title: string; threads: HighlightThread[] }) {
  return (
    <div className="bg-card/40 border border-primary/20 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-heading text-white">{title}</h3>
      </div>
      <div className="space-y-3">
        {threads.map((thread) => (
          <Link key={thread.id} href={tenantHref(`/forum/thread/${thread.id}`)}>
            <div className="flex items-center justify-between border border-primary/20 p-3 hover:border-primary/60 cursor-pointer">
              <div className="space-y-1">
                <p className="text-white text-sm">{thread.title}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                  <span>{thread.category?.name}</span>
                  <span className="h-1 w-1 rounded-full bg-primary/60" />
                  <span>{thread.author?.displayName || thread.author?.username}</span>
                  <span className="h-1 w-1 rounded-full bg-primary/60" />
                  <span>{new Date(thread.lastActivityAt || thread.createdAt).toLocaleString("tr-TR")}</span>
                </p>
              </div>
              <div className="text-xs text-primary flex items-center gap-3">
                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{thread.repliesCount}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{thread.viewsCount}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
        {threads.length === 0 && <p className="text-muted-foreground text-sm">Henüz veri yok.</p>}
      </div>
    </div>
  );
}

export default function ForumShowcase() {
  const { data } = useQuery<Highlights>({
    queryKey: ["forum", "highlights", apiBasePath],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/forum/highlights`);
      if (!res.ok) throw new Error("Forum vitrin verisi alınamadı");
      return res.json();
    },
  });

  const newest = useMemo(() => data?.newest ?? [], [data]);
  const mostAnswered = useMemo(() => data?.mostAnswered ?? [], [data]);
  const mostViewed = useMemo(() => data?.mostViewed ?? [], [data]);

  return (
    <section className="py-16 bg-background" id="forum">
      <div className="container mx-auto px-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <p className="text-sm font-mono text-primary">FORUM VİTRİNİ</p>
            <h2 className="text-4xl font-heading text-white">Topluluk Nabzı</h2>
            <p className="text-muted-foreground max-w-xl">Yeni açılan konular, en çok konuşulan başlıklar ve en çok okunan paylaşımlar burada.</p>
          </div>
          <Link href={tenantHref(`/forum`)} className="text-primary hover:text-white text-sm font-mono flex items-center gap-2">
            Foruma git <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <ThreadList title="Yeni Konular" threads={newest.slice(0, 5)} />
          <ThreadList title="En Çok Cevaplanan" threads={mostAnswered.slice(0, 5)} />
          <ThreadList title="En Çok Görüntülenen" threads={mostViewed.slice(0, 5)} />
        </div>
      </div>
    </section>
  );
}
