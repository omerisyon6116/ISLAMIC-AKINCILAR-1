import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CallToAction, useSiteContent } from "@/lib/site-content";
import { Link } from "wouter";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { ArrowLeft, Edit2, Plus, RotateCw, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type EventInfo = {
  id: string;
  title: string;
  category: string | null;
  eventDate: string | null;
  location: string | null;
  description: string | null;
};

type PostInfo = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
};

type MemberRow = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
};

const emptyEvent: Omit<EventInfo, "id"> = {
  title: "",
  category: "",
  eventDate: "",
  location: "",
  description: "",
};

const emptyPost: Omit<PostInfo, "id" | "status" | "createdAt"> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  publishedAt: "",
};

export default function Admin() {
  const { content, updateHeroCta, updateNavCta, updateHeroContent, refresh } = useSiteContent();
  const [ctaDrafts, setCtaDrafts] = useState<CallToAction[]>(content.heroCtas);
  const [navDraft, setNavDraft] = useState<CallToAction>(content.navCta);
  const [newEvent, setNewEvent] = useState<Omit<EventInfo, "id">>(emptyEvent);
  const [editingEvent, setEditingEvent] = useState<EventInfo | null>(null);
  const [newPost, setNewPost] = useState<Omit<PostInfo, "id" | "status" | "createdAt">>(emptyPost);
  const [editingPost, setEditingPost] = useState<PostInfo | null>(null);
  const [auditPage, setAuditPage] = useState(1);
  const { toast } = useToast();

  const eventsQuery = useQuery<{ events: EventInfo[] }>({
    queryKey: ["events", "admin"],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/events`, { credentials: "include" });
      if (!res.ok) throw new Error("Etkinlikler yüklenemedi");
      return res.json();
    },
  });

  const events = eventsQuery.data?.events ?? [];

  const postsQuery = useQuery<{ posts: PostInfo[] }>({
    queryKey: ["posts", "admin"],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/posts`, { credentials: "include" });
      if (!res.ok) throw new Error("Yazılar yüklenemedi");
      return res.json();
    },
  });

  const posts = postsQuery.data?.posts ?? [];

  const membersQuery = useQuery<{ members: MemberRow[] }>({
    queryKey: ["members", "admin"],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/admin/members`, { credentials: "include" });
      if (!res.ok) throw new Error("Üyeler alınamadı");
      return res.json();
    },
  });

  const members = membersQuery.data?.members ?? [];

  const auditLogsQuery = useQuery<{ logs: any[] }>({
    queryKey: ["audit-logs", auditPage],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/admin/audit-logs?page=${auditPage}&limit=10`, { credentials: "include" });
      if (!res.ok) throw new Error("Kayıtlar alınamadı");
      return res.json();
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (payload: Partial<EventInfo>) => {
      const res = await apiRequest("POST", `${apiBasePath}/admin/events`, payload);
      return res.json();
    },
    onSuccess: () => eventsQuery.refetch(),
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<EventInfo> }) => {
      const res = await apiRequest("PATCH", `${apiBasePath}/admin/events/${id}`, payload);
      return res.json();
    },
    onSuccess: () => eventsQuery.refetch(),
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `${apiBasePath}/admin/events/${id}`);
      return res.json();
    },
    onSuccess: () => eventsQuery.refetch(),
  });

  const createPostMutation = useMutation({
    mutationFn: async (payload: Partial<PostInfo>) => {
      const res = await apiRequest("POST", `${apiBasePath}/admin/posts`, payload);
      return res.json();
    },
    onSuccess: () => postsQuery.refetch(),
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<PostInfo> }) => {
      const res = await apiRequest("PATCH", `${apiBasePath}/admin/posts/${id}`, payload);
      return res.json();
    },
    onSuccess: () => postsQuery.refetch(),
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `${apiBasePath}/admin/posts/${id}`);
      return res.json();
    },
    onSuccess: () => postsQuery.refetch(),
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await apiRequest("PATCH", `${apiBasePath}/admin/members/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: () => membersQuery.refetch(),
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `${apiBasePath}/admin/members/${userId}`);
      return res.json();
    },
    onSuccess: () => membersQuery.refetch(),
  });

  useEffect(() => setCtaDrafts(content.heroCtas), [content.heroCtas]);
  useEffect(() => setNavDraft(content.navCta), [content.navCta]);

  const totalEventsLabel = useMemo(() => {
    if (events.length === 0) return "Henüz etkinlik yok";
    if (events.length === 1) return "1 aktif görev";
    return `${events.length} aktif görev`;
  }, [events.length]);

  const handleSaveCtas = () => {
    const hasEmpty = ctaDrafts.some((cta) => !cta.label.trim() || !cta.href.trim());
    if (hasEmpty) {
      toast({
        title: "Eksik alan var",
        description: "Hero butonları için hem yazı hem bağlantı doldurulmalı.",
        variant: "destructive",
      });
      return;
    }

    ctaDrafts.forEach((cta) => updateHeroCta(cta.id, cta));
    toast({ title: "Hero butonları güncellendi", description: "Değişiklikler kaydedildi." });
  };

  const handleSaveNav = () => {
    if (!navDraft.label.trim() || !navDraft.href.trim()) {
      toast({
        title: "Navigasyon butonu boş olamaz",
        description: "Başlık ve bağlantı girildiğinden emin olun.",
        variant: "destructive",
      });
      return;
    }

    updateNavCta(navDraft);
    toast({ title: "Navigasyon güncellendi", description: "Üst menü butonu kaydedildi." });
  };

  const mapEventPayload = (payload: Omit<EventInfo, "id"> | EventInfo) => ({
    title: payload.title,
    category: payload.category || undefined,
    description: payload.description || undefined,
    location: payload.location || undefined,
    eventDate: payload.eventDate ? new Date(payload.eventDate).toISOString() : undefined,
  });

  const handleAddEvent = async (event: FormEvent<HTMLFormElement>) => {
  const mapPostPayload = (payload: Partial<PostInfo>) => ({
    title: payload.title,
    slug: payload.slug,
    excerpt: payload.excerpt,
    content: payload.content,
    status: payload.status ?? "published",
    publishedAt: payload.publishedAt ? new Date(payload.publishedAt).toISOString() : undefined,
  });

  const handleAddEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newEvent.title.trim()) {
      toast({
        title: "Başlık gerekli",
        description: "Etkinlik adı olmadan kart oluşturulamaz.",
        variant: "destructive",
      });
      return;
    }

    await createEventMutation.mutateAsync(mapEventPayload(newEvent));
    setNewEvent(emptyEvent);
    toast({
      title: "Etkinlik eklendi",
      description: `${newEvent.title} listede yayınlandı.`,
    });
  };

  const handleUpdateEvent = async (event: FormEvent<HTMLFormElement>) => {
  const handleUpdateEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingEvent) return;
    await updateEventMutation.mutateAsync({ id: editingEvent.id, payload: mapEventPayload(editingEvent) });
    setEditingEvent(null);
    toast({ title: "Etkinlik güncellendi" });
  };

  const handleRemoveEvent = (id: string, title: string) => {
    deleteEventMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Etkinlik silindi",
          description: `${title} listeden kaldırıldı.`,
        });
      },
    });
  };

  const handleAddPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newPost.title.trim() || !newPost.slug.trim() || !newPost.content.trim()) {
      toast({
        title: "Zorunlu alanlar boş",
        description: "Başlık, içerik ve slug doldurulmalıdır.",
        variant: "destructive",
      });
      return;
    }

    await createPostMutation.mutateAsync(mapPostPayload({ ...newPost, status: "published" }));
    setNewPost(emptyPost);
    toast({ title: "Yazı oluşturuldu" });
  };

  const handleUpdatePost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPost) return;
    await updatePostMutation.mutateAsync({ id: editingPost.id, payload: mapPostPayload(editingPost) });
    setEditingPost(null);
    toast({ title: "Yazı güncellendi" });
  };

  const handleRemovePost = (id: string, title: string) => {
    deletePostMutation.mutate(id, {
      onSuccess: () => toast({ title: "Yazı silindi", description: `${title} kaldırıldı.` }),
    });
  };

  const handleChangeRole = (userId: string, role: string) => {
    updateMemberRoleMutation.mutate({ userId, role }, {
      onSuccess: () => toast({ title: "Rol güncellendi" }),
    });
  };

  const handleRemoveMember = (member: MemberRow) => {
    deleteMemberMutation.mutate(member.id, {
      onSuccess: () => toast({ title: "Üyelik kaldırıldı", description: member.username }),
      onError: () => toast({ title: "Silme başarısız", variant: "destructive" }),
    });
  };

  const handleReset = () => {
    refresh();
    setEditingEvent(null);
    toast({
      title: "Varsayılan içerik yüklendi",
      description: "Butonlar ve etkinlikler ilk haline döndürüldü.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-primary/30 bg-gradient-to-r from-background via-background/70 to-background/50">
        <div className="container mx-auto px-6 py-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-mono text-primary">Yönetim Konsolu</p>
            <h1 className="text-4xl md:text-5xl font-heading font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary">
              AKINCILAR ADMIN PANEL
            </h1>
            <p className="text-muted-foreground max-w-2xl mt-2">
              Etkinlik kartlarını güncelle, buton etiketlerini değiştir ve siteyi canlı tut.
              Yapılan her değişiklik tarayıcında saklanır ve hemen yansır.
            </p>
          </div>
          <Link href={tenantHref("/")}>
            <a className="inline-flex items-center gap-2 text-sm font-mono text-primary hover:text-white border border-primary/30 px-4 py-2 clip-path-cyber">
              <ArrowLeft className="w-4 h-4" /> Ana sayfaya dön
            </a>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 space-y-8">
        <Card className="border-primary/30 bg-card/60">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <CardTitle>Buton Yönetimi</CardTitle>
              <CardDescription>
                Hero bölümündeki ve navigasyondaki çağrı butonlarının yazılarını ve bağlantılarını düzenle.
              </CardDescription>
            </div>
            <Button variant="ghost" className="gap-2" onClick={handleReset}>
              <RotateCw className="w-4 h-4" /> Varsayılanlara döndür
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {ctaDrafts.map((cta, index) => (
                <div key={cta.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono text-primary/80">Hero Butonu #{index + 1}</p>
                      <p className="text-sm text-muted-foreground">Kullanıcıların ilk gördüğü aksiyon.</p>
                    </div>
                    <Badge variant="outline" className="border-primary text-primary bg-primary/10">
                      {cta.id}
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid gap-1">
                      <Label htmlFor={`${cta.id}-label`}>Buton yazısı</Label>
                      <Input
                        id={`${cta.id}-label`}
                        value={ctaDrafts[index]?.label ?? ""}
                        onChange={(event) => {
                          const updated = [...ctaDrafts];
                          updated[index] = { ...cta, label: event.target.value };
                          setCtaDrafts(updated);
                        }}
                        placeholder="Örn. SİSTEME GİR"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor={`${cta.id}-href`}>Bağlantı</Label>
                      <Input
                        id={`${cta.id}-href`}
                        value={ctaDrafts[index]?.href ?? ""}
                        onChange={(event) => {
                          const updated = [...ctaDrafts];
                          updated[index] = { ...cta, href: event.target.value };
                          setCtaDrafts(updated);
                        }}
                        placeholder="#activities"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border border-primary/20 p-4 bg-black/30">
              <div className="space-y-1">
                <p className="font-semibold">Navigasyon Butonu</p>
                <p className="text-sm text-muted-foreground">Üst menüdeki ana katılım çağrısı.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 md:items-end flex-1 md:pl-6">
                <div className="grid gap-1">
                  <Label htmlFor="nav-label">Buton yazısı</Label>
                  <Input
                    id="nav-label"
                    value={navDraft.label}
                    onChange={(event) => setNavDraft({ ...navDraft, label: event.target.value })}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="nav-href">Bağlantı</Label>
                  <Input
                    id="nav-href"
                    value={navDraft.href}
                    onChange={(event) => setNavDraft({ ...navDraft, href: event.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSaveCtas} className="gap-2">
                <Save className="w-4 h-4" /> Hero butonlarını kaydet
              </Button>
              <Button onClick={handleSaveNav} variant="secondary" className="gap-2">
                <Save className="w-4 h-4" /> Navigasyon butonunu güncelle
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-card/60">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Etkinlik Yönetimi</CardTitle>
              <CardDescription>Yeni görevler ekle, mevcut kartları düzenle veya kaldır.</CardDescription>
            </div>
            <Badge variant="outline" className="border-primary text-primary bg-primary/10">
              {totalEventsLabel}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAddEvent} className="grid gap-4 md:grid-cols-2 md:items-end bg-black/30 border border-primary/10 p-4">
              <div className="grid gap-2">
                <Label htmlFor="event-title">Etkinlik adı</Label>
                <Input
                  id="event-title"
                  value={newEvent.title}
                  onChange={(event) => setNewEvent({ ...newEvent, title: event.target.value })}
                  required
                  placeholder="Örn. Ramazan İftarı"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-category">Kategori</Label>
                <Input
                  id="event-category"
                  value={newEvent.category}
                  onChange={(event) => setNewEvent({ ...newEvent, category: event.target.value })}
                  placeholder="Örn. Sosyal, Eğitim"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-date">Tarih / saat</Label>
                <Input
                  id="event-date"
                  value={newEvent.eventDate ?? ""}
                  onChange={(event) => setNewEvent({ ...newEvent, eventDate: event.target.value })}
                  placeholder="OCT 25 | 14:00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-location">Konum</Label>
                <Input
                  id="event-location"
                  value={newEvent.location}
                  onChange={(event) => setNewEvent({ ...newEvent, location: event.target.value })}
                  placeholder="Örn. Merkez Bina"
                />
              </div>
              <div className="md:col-span-2 grid gap-2">
                <Label htmlFor="event-description">Açıklama</Label>
                <Textarea
                  id="event-description"
                  value={newEvent.description}
                  onChange={(event) => setNewEvent({ ...newEvent, description: event.target.value })}
                  placeholder="Gençleri davet eden kısa bir not yazın."
                  rows={3}
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" className="gap-2">
                  <Plus className="w-4 h-4" /> Etkinlik ekle
                </Button>
              </div>
            </form>

            <Separator className="bg-primary/20" />

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/20">
                    <TableHead>Başlık</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Konum</TableHead>
                    <TableHead className="text-right">Aksiyonlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Yükleniyor...
                      </TableCell>
                    </TableRow>
                  ) : events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Hiç etkinlik yok. Yukarıdan yeni bir görev ekle.
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event) => (
                      <TableRow key={event.id} className="border-primary/10">
                        <TableCell className="font-medium text-primary">{event.title}</TableCell>
                        <TableCell>{event.category || "—"}</TableCell>
                        <TableCell>{event.eventDate || "—"}</TableCell>
                        <TableCell>{event.location || "—"}</TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="gap-2"
                            onClick={() => setEditingEvent(event)}
                          >
                            <Edit2 className="w-4 h-4" /> Düzenle
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleRemoveEvent(event.id, event.title)}
                          >
                            <Trash2 className="w-4 h-4" /> Sil
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-card/60">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Blog Yönetimi</CardTitle>
              <CardDescription>Yeni yazı oluştur, güncelle veya sil.</CardDescription>
            </div>
            <Badge variant="outline" className="border-primary text-primary bg-primary/10">
              {posts.length || 0} yazı
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              onSubmit={handleAddPost}
              className="grid gap-4 md:grid-cols-2 md:items-end bg-black/30 border border-primary/10 p-4"
            >
              <div className="grid gap-2">
                <Label htmlFor="post-title">Başlık</Label>
                <Input
                  id="post-title"
                  value={newPost.title}
                  onChange={(event) => setNewPost({ ...newPost, title: event.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="post-slug">Slug</Label>
                <Input
                  id="post-slug"
                  value={newPost.slug}
                  onChange={(event) => setNewPost({ ...newPost, slug: event.target.value })}
                  required
                  placeholder="ornek-yazi"
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="post-excerpt">Özet</Label>
                <Textarea
                  id="post-excerpt"
                  value={newPost.excerpt ?? ""}
                  onChange={(event) => setNewPost({ ...newPost, excerpt: event.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="post-content">İçerik</Label>
                <Textarea
                  id="post-content"
                  value={newPost.content}
                  onChange={(event) => setNewPost({ ...newPost, content: event.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="post-publishedAt">Yayın Tarihi (opsiyonel)</Label>
                <Input
                  id="post-publishedAt"
                  value={newPost.publishedAt ?? ""}
                  onChange={(event) => setNewPost({ ...newPost, publishedAt: event.target.value })}
                />
              </div>
              <div className="flex justify-end md:justify-start">
                <Button type="submit" className="gap-2">
                  <Plus className="w-4 h-4" /> Yazı Ekle
                </Button>
              </div>
            </form>

            <div className="rounded-md border border-primary/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5">
                    <TableHead>Başlık</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Oluşturma</TableHead>
                    <TableHead className="text-right">Aksiyonlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Yükleniyor...
                      </TableCell>
                    </TableRow>
                  ) : posts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Henüz yazı yok.
                      </TableCell>
                    </TableRow>
                  ) : (
                    posts.map((post) => (
                      <TableRow key={post.id} className="border-primary/10">
                        <TableCell className="font-medium text-primary">{post.title}</TableCell>
                        <TableCell>{post.slug}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/40 text-xs">
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(post.createdAt).toLocaleDateString("tr-TR")}</TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="gap-2"
                            onClick={() => setEditingPost(post)}
                          >
                            <Edit2 className="w-4 h-4" /> Düzenle
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleRemovePost(post.id, post.title)}
                          >
                            <Trash2 className="w-4 h-4" /> Sil
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-card/60">
          <CardHeader>
            <CardTitle>Üyeler ve Roller</CardTitle>
            <CardDescription>Yetki seviyelerini güncelleyin, gerekirse üyeleri kaldırın.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-primary/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5">
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Katılım</TableHead>
                    <TableHead className="text-right">Aksiyon</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Yükleniyor...
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Üye bulunamadı.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id} className="border-primary/10">
                        <TableCell className="font-medium text-primary">{member.displayName || member.username}</TableCell>
                        <TableCell>
                          <select
                            value={member.role}
                            onChange={(event) => handleChangeRole(member.id, event.target.value)}
                            className="bg-background border border-primary/30 px-2 py-1 text-sm"
                          >
                            {["member", "moderator", "admin", "owner", "superadmin"].map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>{member.status}</TableCell>
                        <TableCell>{new Date(member.joinedAt).toLocaleDateString("tr-TR")}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleRemoveMember(member)}
                          >
                            <Trash2 className="w-4 h-4" /> Kaldır
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-card/60">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Denetim Kayıtları</CardTitle>
              <CardDescription>Son işlemlerin kaydı (sadece okunur).</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="ghost"
                size="sm"
                disabled={auditPage === 1}
                onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
              >
                Önceki
              </Button>
              <span className="text-primary">Sayfa {auditPage}</span>
              <Button variant="ghost" size="sm" onClick={() => setAuditPage((p) => p + 1)}>
                Sonraki
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-primary/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5">
                    <TableHead>İşlem</TableHead>
                    <TableHead>Hedef</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Yükleniyor...
                      </TableCell>
                    </TableRow>
                  ) : (auditLogsQuery.data?.logs ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        Kayıt bulunamadı.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (auditLogsQuery.data?.logs ?? []).map((log) => (
                      <TableRow key={log.id} className="border-primary/10">
                        <TableCell className="font-mono text-xs text-primary">
                          {log.actionType} / {log.targetType}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.targetId}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString("tr-TR")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
        <DialogContent className="bg-card/80 border-primary/30">
          <DialogHeader>
            <DialogTitle>Etkinliği düzenle</DialogTitle>
            <DialogDescription>Bilgileri güncelle ve kartı kaydet.</DialogDescription>
          </DialogHeader>
          {editingEvent && (
            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Etkinlik adı</Label>
                <Input
                  id="edit-title"
                  value={editingEvent.title}
                  onChange={(event) => setEditingEvent({ ...editingEvent, title: event.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2 md:grid-cols-2 md:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Kategori</Label>
                  <Input
                    id="edit-category"
                    value={editingEvent.category}
                    onChange={(event) => setEditingEvent({ ...editingEvent, category: event.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-date">Tarih / saat</Label>
                  <Input
                    id="edit-date"
                    value={editingEvent.eventDate ?? ""}
                    onChange={(event) => setEditingEvent({ ...editingEvent, eventDate: event.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2 md:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">Konum</Label>
                  <Input
                    id="edit-location"
                    value={editingEvent.location}
                    onChange={(event) => setEditingEvent({ ...editingEvent, location: event.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Açıklama</Label>
                  <Textarea
                    id="edit-description"
                    value={editingEvent.description}
                    onChange={(event) => setEditingEvent({ ...editingEvent, description: event.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="flex gap-2 sm:gap-4">
                <Button type="button" variant="ghost" onClick={() => setEditingEvent(null)}>
                  Vazgeç
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="w-4 h-4" /> Kaydet
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent className="bg-card/80 border-primary/30">
          <DialogHeader>
            <DialogTitle>Yazıyı düzenle</DialogTitle>
            <DialogDescription>Başlık, slug veya içeriği güncelle.</DialogDescription>
          </DialogHeader>
          {editingPost && (
            <form onSubmit={handleUpdatePost} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-post-title">Başlık</Label>
                <Input
                  id="edit-post-title"
                  value={editingPost.title}
                  onChange={(event) => setEditingPost({ ...editingPost, title: event.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-post-slug">Slug</Label>
                <Input
                  id="edit-post-slug"
                  value={editingPost.slug}
                  onChange={(event) => setEditingPost({ ...editingPost, slug: event.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-post-excerpt">Özet</Label>
                <Textarea
                  id="edit-post-excerpt"
                  value={editingPost.excerpt ?? ""}
                  onChange={(event) => setEditingPost({ ...editingPost, excerpt: event.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-post-content">İçerik</Label>
                <Textarea
                  id="edit-post-content"
                  value={editingPost.content}
                  onChange={(event) => setEditingPost({ ...editingPost, content: event.target.value })}
                  rows={4}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-post-publishedAt">Yayın Tarihi</Label>
                <Input
                  id="edit-post-publishedAt"
                  value={editingPost.publishedAt ?? ""}
                  onChange={(event) => setEditingPost({ ...editingPost, publishedAt: event.target.value })}
                />
              </div>
              <DialogFooter className="flex gap-2 sm:gap-4">
                <Button type="button" variant="ghost" onClick={() => setEditingPost(null)}>
                  Vazgeç
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="w-4 h-4" /> Kaydet
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
