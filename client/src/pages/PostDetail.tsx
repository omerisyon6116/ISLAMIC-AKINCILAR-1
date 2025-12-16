import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Link } from "wouter";
import { ArrowLeft, Calendar } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
};

export default function PostDetail({ postId }: { postId: string }) {
  const { data, isLoading } = useQuery<{ post: Post }>({
    queryKey: ["post", postId],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/posts/${postId}`);
      if (!res.ok) throw new Error("Yazı bulunamadı");
      return res.json();
    },
  });

  const post = data?.post;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-24 max-w-4xl">
        <Link href={tenantHref("/")} className="inline-flex items-center gap-2 text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Ana sayfaya dön
        </Link>

        {isLoading && <div className="text-primary font-mono">Yükleniyor...</div>}

        {!isLoading && !post && <div className="text-destructive">Yazı bulunamadı</div>}

        {post && (
          <article className="space-y-4 bg-card/50 border border-primary/20 p-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt || post.createdAt).toLocaleString("tr-TR")}
              </span>
              <span className="font-mono px-2 py-1 border border-primary/30 text-primary">{post.status}</span>
            </div>
            <h1 className="text-3xl font-heading font-bold text-white">{post.title}</h1>
            <p className="text-muted-foreground">{post.excerpt}</p>
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
