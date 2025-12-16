import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Link } from "wouter";
import { ArrowRight, MessageCircle } from "lucide-react";

type Category = {
  id: string;
  name: string;
  description: string | null;
};

type Thread = {
  id: string;
  title: string;
  repliesCount: number;
  lastActivityAt: string;
  categoryId: string;
};

type ActivityItem = {
  id: string;
  title: string;
  type?: string;
  refId?: string;
};

export default function ForumHome() {
  const { data: categoriesData, isLoading: loadingCategories } = useQuery<{ categories: Category[] }>({
    queryKey: ["forum", "categories"],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/forum/categories`);
      if (!res.ok) throw new Error("Kategoriler yüklenemedi");
      return res.json();
    },
  });

  const { data: activityData, isLoading: loadingActivity } = useQuery<{ items: ActivityItem[] }>({
    queryKey: ["forum", "activity", "home"],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/activity?limit=10`);
      if (!res.ok) throw new Error("Aktivite yüklenemedi");
      return res.json();
    },
  });

  const { data: needsData, isLoading: loadingNeeds } = useQuery<{ threads: Thread[] }>({
    queryKey: ["forum", "needs-answers"],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/forum/needs-answers`);
      if (!res.ok) throw new Error("Yanıt bekleyenler yüklenemedi");
      return res.json();
    },
  });

  const categories = categoriesData?.categories ?? [];
  const activity = activityData?.items?.filter((item) => item) ?? [];
  const needsAnswers = needsData?.threads ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-16 space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-mono text-primary">TOPLULUK FORUMU</p>
          <h1 className="text-4xl font-heading font-bold text-white">Sorular, Yanıtlar, Hareket</h1>
          <p className="text-muted-foreground max-w-2xl">
            Kategorilere göz atın, en güncel başlıklara katılın ve yanıt bekleyenleri destekleyin.
          </p>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading text-white">Kategoriler</h2>
          </div>
          {loadingCategories && <div className="text-muted-foreground">Yükleniyor...</div>}
          <div className="grid md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={tenantHref(`/forum/category/${category.id}`)}>
                <div className="border border-primary/30 bg-card/40 p-5 hover:border-primary/60 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-heading text-white">{category.name}</h3>
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="border border-primary/20 bg-card/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading text-white">Yeni Konular</h3>
              {loadingActivity && <span className="text-xs text-muted-foreground">Yükleniyor...</span>}
            </div>
            <div className="space-y-3">
              {activity
                .filter((item) => (item as any).type === "thread")
                .slice(0, 5)
                .map((item) => (
                  <Link key={item.id} href={tenantHref(`/forum/thread/${item.refId || item.id}`)}>
                    <div className="flex items-center justify-between text-sm border border-primary/20 p-3 hover:border-primary/60 cursor-pointer">
                      <span className="text-white">{item.title}</span>
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  </Link>
                ))}
              {!loadingActivity && activity.filter((item) => (item as any).type === "thread").length === 0 && (
                <p className="text-muted-foreground text-sm">Henüz konu yok.</p>
              )}
            </div>
          </div>

          <div className="border border-primary/20 bg-card/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading text-white">Yanıt Bekleyenler</h3>
              {loadingNeeds && <span className="text-xs text-muted-foreground">Yükleniyor...</span>}
            </div>
            <div className="space-y-3">
              {needsAnswers.map((thread) => (
                <Link key={thread.id} href={tenantHref(`/forum/thread/${thread.id}`)}>
                  <div className="flex items-center justify-between border border-primary/20 p-3 hover:border-primary/60 cursor-pointer">
                    <div>
                      <p className="text-white">{thread.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {thread.repliesCount} yanıt
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </Link>
              ))}
              {!loadingNeeds && needsAnswers.length === 0 && (
                <p className="text-muted-foreground text-sm">Tüm konular yanıtlanmış görünüyor.</p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

