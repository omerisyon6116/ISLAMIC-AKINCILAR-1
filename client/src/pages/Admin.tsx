import { useEffect, useMemo, useState } from "react";
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
import { CallToAction, EventInfo, useSiteContent } from "@/lib/site-content";
import { Link } from "wouter";
import { ArrowLeft, Edit2, Plus, Save, Trash2 } from "lucide-react";

const emptyEvent: Omit<EventInfo, "id"> = {
  title: "",
  category: "",
  date: "",
  location: "",
  description: "",
};

export default function Admin() {
  const { content, updateHeroCta, updateNavCta, addEvent, updateEvent, removeEvent } =
    useSiteContent();
  const [ctaDrafts, setCtaDrafts] = useState<CallToAction[]>(content.heroCtas);
  const [navDraft, setNavDraft] = useState<CallToAction>(content.navCta);
  const [newEvent, setNewEvent] = useState<Omit<EventInfo, "id">>(emptyEvent);
  const [editingEvent, setEditingEvent] = useState<EventInfo | null>(null);

  useEffect(() => setCtaDrafts(content.heroCtas), [content.heroCtas]);
  useEffect(() => setNavDraft(content.navCta), [content.navCta]);

  const totalEventsLabel = useMemo(() => {
    if (content.events.length === 0) return "Henüz etkinlik yok";
    if (content.events.length === 1) return "1 aktif görev";
    return `${content.events.length} aktif görev`;
  }, [content.events.length]);

  const handleSaveCtas = () => {
    ctaDrafts.forEach((cta) => updateHeroCta(cta.id, cta));
  };

  const handleSaveNav = () => {
    updateNavCta(navDraft);
  };

  const handleAddEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newEvent.title.trim()) return;
    addEvent(newEvent);
    setNewEvent(emptyEvent);
  };

  const handleUpdateEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingEvent) return;
    updateEvent(editingEvent.id, editingEvent);
    setEditingEvent(null);
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
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-sm font-mono text-primary hover:text-white border border-primary/30 px-4 py-2 clip-path-cyber">
              <ArrowLeft className="w-4 h-4" /> Ana sayfaya dön
            </a>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 space-y-8">
        <Card className="border-primary/30 bg-card/60">
          <CardHeader>
            <CardTitle>Buton Yönetimi</CardTitle>
            <CardDescription>
              Hero bölümündeki ve navigasyondaki çağrı butonlarının yazılarını ve bağlantılarını düzenle.
            </CardDescription>
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
                  value={newEvent.date}
                  onChange={(event) => setNewEvent({ ...newEvent, date: event.target.value })}
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
                  {content.events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Hiç etkinlik yok. Yukarıdan yeni bir görev ekle.
                      </TableCell>
                    </TableRow>
                  ) : (
                    content.events.map((event) => (
                      <TableRow key={event.id} className="border-primary/10">
                        <TableCell className="font-medium text-primary">{event.title}</TableCell>
                        <TableCell>{event.category || "—"}</TableCell>
                        <TableCell>{event.date || "—"}</TableCell>
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
                            onClick={() => removeEvent(event.id)}
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
                    value={editingEvent.date}
                    onChange={(event) => setEditingEvent({ ...editingEvent, date: event.target.value })}
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
    </div>
  );
}
