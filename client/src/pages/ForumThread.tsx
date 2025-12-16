import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiBasePath } from "@/lib/tenant";
import { useAuth } from "@/lib/auth";
import { FormEvent, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageCircle, Eye } from "lucide-react";

type ThreadResponse = {
  thread: {
    id: string;
    title: string;
    body: string;
    isLocked: boolean;
    repliesCount: number;
    viewsCount: number;
    isSubscribed?: boolean;
    isSaved?: boolean;
    author?: { displayName?: string | null; username: string };
    createdAt: string;
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
  const [togglingSub, setTogglingSub] = useState(false);
  const [togglingSave, setTogglingSave] = useState(false);

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

  const toggleSubscribe = async () => {
    if (!thread) return;
    setTogglingSub(true);
    const method = thread.isSubscribed ? "DELETE" : "POST";
    const res = await fetch(`${apiBasePath}/forum/threads/${threadId}/subscribe`, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    setTogglingSub(false);
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["forum", "thread", threadId] });
    }
  };

  const toggleSave = async () => {
    if (!thread) return;
    setTogglingSave(true);
    const method = thread.isSaved ? "DELETE" : "POST";
    const res = await fetch(`${apiBasePath}/forum/threads/${threadId}/save`, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    setTogglingSave(false);
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ["forum", "thread", threadId] });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-16 space-y-6">
        {thread && (
          <article className="border border-primary/30 bg-card/40 p-5 space-y-3">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>{thread.author?.displayName || thread.author?.username}</span>
              <span>• {new Date(thread.createdAt).toLocaleString("tr-TR")}</span>
            </div>
            <h1 className="text-3xl font-heading text-white">{thread.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> {thread.repliesCount} yanıt
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> {thread.viewsCount} görüntüleme
              </span>
              {thread.repliesCount === 0 && (
                <span className="text-[11px] text-primary border border-primary/40 px-2 py-0.5">Cevap bekliyor</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{thread.body}</p>
            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleSubscribe}
                    disabled={togglingSub}
                    className="border-primary/60"
                  >
                    {thread.isSubscribed ? "Takipten çık" : "Takip et"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleSave}
                    disabled={togglingSave}
                    className="border-primary/60"
                  >
                    {thread.isSaved ? "Kaydedildi" : "Kaydet"}
                  </Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Takip ve kaydetmek için giriş yap.</p>
              )}
            </div>
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
                <span>{reply.author?.displayName || reply.author?.username}</span>
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

