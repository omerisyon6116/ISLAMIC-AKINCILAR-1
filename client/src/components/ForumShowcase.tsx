import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowUpRight, Flame, MessageCircle, View } from "lucide-react";
import { apiBasePath, tenantHref } from "@/lib/tenant";

const sections = [
  { key: "latest", title: "Yeni Konular", icon: Flame },
  { key: "mostReplied", title: "En Çok Cevaplanan", icon: MessageCircle },
  { key: "mostViewed", title: "En Çok Görüntülenen", icon: View },
] as const;

type ThreadHighlight = {
  id: string;
  title: string;
  repliesCount: number;
  viewsCount: number;
  categoryId: string;
};

type HighlightsResponse = {
  latest: ThreadHighlight[];
  mostReplied: ThreadHighlight[];
  mostViewed: ThreadHighlight[];
};

export default function ForumShowcase() {
  const { data, isLoading } = useQuery<HighlightsResponse>({
    queryKey: ["forum", "highlights"],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/forum/highlights`);
      if (!res.ok) throw new Error("Forum vitrin verisi alınamadı");
      return res.json();
    },
  });

  const highlights = useMemo(() => data ?? { latest: [], mostReplied: [], mostViewed: [] }, [data]);

  return (
    <section className="py-20 bg-black/80 border-y border-primary/10" id="forum">
      <div className="container mx-auto px-6 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-mono text-primary">FORUM VİTRİNİ</p>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-white">Topluluğun nabzı</h2>
            <p className="text-muted-foreground max-w-2xl mt-2">
              En yeni başlıklar, en çok konuşulanlar ve en çok ziyaret edilenleri keşfet.
            </p>
          </div>
          <Link
            href={tenantHref("/forum")}
            className="inline-flex items-center gap-2 text-primary border border-primary/30 px-5 py-2 font-mono text-xs hover:bg-primary/10 transition-colors"
          >
            FORUMA GİT <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {sections.map(({ key, title, icon: Icon }) => {
            const threads = (highlights as any)[key] as ThreadHighlight[];
            return (
              <div key={key} className="bg-card/40 border border-primary/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <h3 className="text-lg font-heading text-white">{title}</h3>
                  </div>
                  {isLoading && <span className="text-xs text-muted-foreground">Yükleniyor...</span>}
                </div>
                <div className="space-y-2">
                  {threads.length === 0 && !isLoading && (
                    <p className="text-sm text-muted-foreground">Kayıt bulunamadı.</p>
                  )}
                  {threads.map((thread) => (
                    <Link key={thread.id} href={tenantHref(`/forum/thread/${thread.id}`)}>
                      <div className="border border-primary/20 hover:border-primary/60 transition-colors p-3 cursor-pointer space-y-1">
                        <p className="text-white text-sm leading-snug">{thread.title}</p>
                        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> {thread.repliesCount} yanıt
                          </span>
                          <span className="flex items-center gap-1">
                            <View className="w-3 h-3" /> {thread.viewsCount} görüntülenme
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
