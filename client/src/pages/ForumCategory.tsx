import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Link } from "wouter";
import { ArrowRight, PlusCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type Thread = {
  id: string;
  title: string;
  body: string;
  isLocked: boolean;
  isPinned: boolean;
  repliesCount: number;
  createdAt: string;
};

type Category = {
  id: string;
  name: string;
  description: string | null;
};

export default function ForumCategory({ categoryId }: { categoryId: string }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery<{ category: Category; threads: Thread[] }>({
    queryKey: ["forum", "category", categoryId],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/forum/categories/${categoryId}/threads?page=1&limit=20`);
      if (!res.ok) throw new Error("Konular yüklenemedi");
      return res.json();
    },
  });

  const { data: followsData } = useQuery<{ categories: Category[] }>({
    queryKey: ["forum", "follows"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/forum/follows`, { credentials: "include" });
      if (!res.ok) throw new Error("Takipler alınamadı");
      return res.json();
    },
  });

  const threads = data?.threads ?? [];
  const isFollowingCategory = (followsData?.categories ?? []).some((c) => c.id === categoryId);

  const toggleFollow = async () => {
    if (!isAuthenticated) return;
    const method = isFollowingCategory ? "DELETE" : "POST";
    await fetch(`${apiBasePath}/forum/follows`, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ targetType: "category", targetId: categoryId }),
    });
    queryClient.invalidateQueries({ queryKey: ["forum", "follows"] });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    const res = await fetch(`${apiBasePath}/forum/categories/${categoryId}/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
      credentials: "include",
    });
    setSubmitting(false);
    if (res.ok) {
      setTitle("");
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["forum", "category", categoryId] });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-16 space-y-8">
        {data && (
          <div className="space-y-2">
            <p className="text-sm font-mono text-primary">FORUM</p>
            <h1 className="text-3xl font-heading text-white">{data.category.name}</h1>
            <p className="text-muted-foreground">{data.category.description}</p>
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFollow}
                className="border-primary/40 text-primary"
              >
                {isFollowingCategory ? "Takipten çık" : "Kategoriyi takip et"}
              </Button>
            )}
          </div>
        )}

        {isLoading && <div className="text-muted-foreground">Yükleniyor...</div>}

        {isAuthenticated && (
          <form onSubmit={onSubmit} className="border border-primary/30 bg-card/40 p-4 space-y-3">
            <div className="flex items-center gap-2 text-primary text-sm">
              <PlusCircle className="w-4 h-4" /> Yeni konu aç
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Başlık"
              required
              className="bg-background"
            />
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Mesajınız"
              required
              className="bg-background min-h-[120px]"
            />
            <Button type="submit" disabled={submitting} className="bg-primary text-black">
              Gönder
            </Button>
          </form>
        )}

        <div className="space-y-3">
          {threads.map((thread) => (
            <Link key={thread.id} href={tenantHref(`/forum/thread/${thread.id}`)}>
              <div className="border border-primary/20 bg-card/40 p-4 hover:border-primary/60 cursor-pointer flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-white text-lg">{thread.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(thread.createdAt).toLocaleString("tr-TR")}</p>
                  {thread.repliesCount === 0 && (
                    <span className="text-[10px] text-destructive border border-destructive/40 px-2 py-1 inline-block">
                      Cevap bekliyor
                    </span>
                  )}
                </div>
                <div className="text-sm text-primary flex items-center gap-1">
                  {thread.repliesCount} yanıt <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
          {!isLoading && threads.length === 0 && <p className="text-muted-foreground">Henüz konu yok.</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}

