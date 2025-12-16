import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Flame, Eye, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { apiBasePath, tenantHref } from "@/lib/tenant";

interface ThreadSummary {
  id: string;
  title: string;
  repliesCount: number;
  viewsCount: number;
  createdAt: string;
}

interface HighlightsResponse {
  newest: ThreadSummary[];
  mostReplied: ThreadSummary[];
  mostViewed: ThreadSummary[];
}

export default function ForumShowcase() {
  const { data, isLoading } = useQuery<HighlightsResponse>({
    queryKey: ["forum", "highlights"],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/forum/highlights`);
      if (!res.ok) throw new Error("Forum verisi alınamadı");
      return res.json();
    },
  });

  const newest = useMemo(() => data?.newest ?? [], [data]);
  const mostReplied = useMemo(() => data?.mostReplied ?? [], [data]);
  const mostViewed = useMemo(() => data?.mostViewed ?? [], [data]);

  const renderList = (items: ThreadSummary[], emptyText: string) => (
    <div className="space-y-3">
      {items.map((thread) => (
        <Link key={thread.id} href={tenantHref(`/forum/thread/${thread.id}`)}>
          <div className="flex items-center justify-between border border-primary/30 bg-card/40 p-3 hover:border-primary/60 transition-colors cursor-pointer">
            <div>
              <p className="text-white text-sm font-heading leading-tight">{thread.title}</p>
              <div className="text-[11px] text-muted-foreground flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {thread.repliesCount} yanıt
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {thread.viewsCount}
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-primary" />
          </div>
        </Link>
      ))}
      {!isLoading && items.length === 0 && (
        <p className="text-muted-foreground text-sm">{emptyText}</p>
      )}
    </div>
  );

  return (
    <section className="py-16 bg-background border-b border-primary/20">
      <div className="container mx-auto px-6 space-y-6">
        <div className="flex items-center gap-3">
          <Flame className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs font-mono text-primary/80">FORUM VİTRİNİ</p>
            <h2 className="text-3xl font-heading text-white">Topluluk Nabzı</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground">Forum yükleniyor...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-primary/30 bg-card/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-heading text-white">Yeni Konular</h3>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
              {renderList(newest, "Henüz konu açılmadı.")}
            </div>

            <div className="border border-primary/30 bg-card/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-heading text-white">En Çok Cevaplanan</h3>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
              {renderList(mostReplied, "Yanıtlanan konu bulunamadı.")}
            </div>

            <div className="border border-primary/30 bg-card/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-heading text-white">En Çok Görüntülenen</h3>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
              {renderList(mostViewed, "Gösterilecek veri yok.")}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
