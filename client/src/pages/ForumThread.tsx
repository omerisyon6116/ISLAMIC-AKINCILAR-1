import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { useAuth } from "@/lib/auth";
import { FormEvent, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Link } from "wouter";

type ThreadResponse = {
  thread: {
    id: string;
    title: string;
    body: string;
    isLocked: boolean;
    author?: { displayName?: string | null; username: string };
    createdAt: string;
    repliesCount: number;
  };
  replies: {
    id: string;
    body: string;
    author?: { displayName?: string | null; username: string };
    createdAt: string;
  }[];
};

export default function ForumThread({ threadId }: { threadId: string }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery<ThreadResponse>({
    queryKey: ["forum", "thread", threadId],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/forum/threads/${threadId}?page=1&limit=50`);
      if (!res.ok) throw new Error("Konu yüklenemedi");
      return res.json();
    },
  });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    const res = await fetch(`${apiBasePath}/forum/threads/${threadId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
      credentials: "include",
    });
    setSubmitting(false);
    if (res.ok) {
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["forum", "thread", threadId] });
    }
  };

  const thread = data?.thread;
  const replies = data?.replies ?? [];

  const { data: followData, refetch: refetchFollow } = useQuery<{ follows: { targetId: string }[] }>({
    queryKey: ["follows", "thread", threadId],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/follows?targetType=thread&targetId=${threadId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Takip bilgisi alınamadı");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: savedData, refetch: refetchSaved } = useQuery<{ saved: { targetId: string; targetType: string }[] }>({
    queryKey: ["saved", "thread", threadId],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/saved?targetType=thread`, { credentials: "include" });
      if (!res.ok) throw new Error("Kaydedilenler alınamadı");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const isFollowing = Boolean(followData?.follows?.length);
  const isSaved = Boolean(savedData?.saved?.find((item) => item.targetId === threadId));

  const toggleFollow = async () => {
    await fetch(`${apiBasePath}/follows`, {
      method: isFollowing ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ targetType: "thread", targetId: threadId }),
    });
    refetchFollow();
  };

  const toggleSave = async () => {
    await fetch(`${apiBasePath}/saved`, {
      method: isSaved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ targetType: "thread", targetId: threadId }),
    });
    refetchSaved();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-16 space-y-6">
        {thread && (
          <article className="border border-primary/30 bg-card/40 p-5 space-y-3">
            <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
              <MessageCircle className="w-4 h-4" />
              <Link href={tenantHref(`/u/${thread.author?.username}`)} className="text-primary">
                {thread.author?.displayName || thread.author?.username}
              </Link>
              <span>• {new Date(thread.createdAt).toLocaleString("tr-TR")}</span>
              {thread.repliesCount === 0 && <span className="text-[10px] bg-primary text-black px-2 py-0.5">Cevap bekliyor</span>}
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-between">
              <h1 className="text-3xl font-heading text-white">{thread.title}</h1>
              {isAuthenticated && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-primary text-primary" onClick={toggleFollow}>
                    {isFollowing ? "Takipten çık" : "Takip et"}
                  </Button>
                  <Button variant="outline" size="sm" className="border-primary text-primary" onClick={toggleSave}>
                    {isSaved ? "Kaydedildi" : "Kaydet"}
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{thread.body}</p>
            {thread.isLocked && (
              <p className="text-xs text-destructive">Bu konu kilitli, yanıt gönderilemez.</p>
            )}
          </article>
        )}

        {isLoading && <div className="text-muted-foreground">Yükleniyor...</div>}

        <section className="space-y-3">
          {replies.map((reply) => (
            <div key={reply.id} className="border border-primary/20 bg-card/40 p-4 space-y-2">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <MessageCircle className="w-3 h-3" />
                <Link href={tenantHref(`/u/${reply.author?.username}`)} className="text-primary">
                  {reply.author?.displayName || reply.author?.username}
                </Link>
                <span>• {new Date(reply.createdAt).toLocaleString("tr-TR")}</span>
              </div>
              <p className="text-sm text-white whitespace-pre-wrap">{reply.body}</p>
            </div>
          ))}
          {!isLoading && replies.length === 0 && <p className="text-muted-foreground">Henüz yanıt yok.</p>}
        </section>

        {isAuthenticated && thread && !thread.isLocked && (
          <form onSubmit={onSubmit} className="border border-primary/30 bg-card/40 p-4 space-y-3">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Yanıtınız"
              required
              className="bg-background min-h-[120px]"
            />
            <Button type="submit" disabled={submitting} className="bg-primary text-black">
              Yanıt Gönder
            </Button>
          </form>
        )}

        {thread?.isLocked && <p className="text-xs text-muted-foreground">Konu kilitli olduğu için yanıt kapalı.</p>}
      </main>
      <Footer />
    </div>
  );
}

