import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Link } from "wouter";
import { Calendar, ArrowRight } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
};

export default function Posts() {
  const { data, isLoading } = useQuery<{ posts: Post[] }>({
    queryKey: ["posts", apiBasePath, "list"],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/posts`);
      if (!res.ok) throw new Error("Yazılar yüklenemedi");
      return res.json();
    },
  });

  const posts = data?.posts ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-16 space-y-6">
        <h1 className="text-3xl font-heading font-bold text-white">Tüm Yazılar</h1>
        {isLoading && <div className="text-primary font-mono">Yükleniyor...</div>}
        {!isLoading && posts.length === 0 && <div className="text-muted-foreground">Henüz yayınlanmış yazı yok.</div>}

        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <article key={post.id} className="border border-primary/20 bg-card/40 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono border border-primary/30 px-2 py-1 text-primary">{post.status}</span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
              <h2 className="text-xl font-heading text-white">{post.title}</h2>
              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
              <Link
                href={tenantHref(`/posts/${post.slug || post.id}`)}
                className="text-primary inline-flex items-center gap-2 text-sm"
              >
                Oku <ArrowRight className="w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
