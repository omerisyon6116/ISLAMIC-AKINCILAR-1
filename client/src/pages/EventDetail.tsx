import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { apiBasePath, tenantHref } from "@/lib/tenant";
import { Link } from "wouter";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";

type Event = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  location: string | null;
  eventDate: string | null;
  createdAt: string;
};

export default function EventDetail({ eventId }: { eventId: string }) {
  const { data, isLoading } = useQuery<{ event: Event }>({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/events/${eventId}`);
      if (!res.ok) throw new Error("Etkinlik bulunamadı");
      return res.json();
    },
  });

  const event = data?.event;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="container mx-auto px-6 py-24 max-w-4xl">
        <Link href={tenantHref("/")} className="inline-flex items-center gap-2 text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Ana sayfaya dön
        </Link>

        {isLoading && <div className="text-primary font-mono">Yükleniyor...</div>}
        {!isLoading && !event && <div className="text-destructive">Etkinlik bulunamadı</div>}

        {event && (
          <article className="space-y-4 bg-card/50 border border-primary/20 p-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="font-mono border border-primary/30 px-2 py-1 text-primary bg-primary/5">{event.category || "GENEL"}</span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(event.eventDate || event.createdAt).toLocaleString("tr-TR")}
              </span>
            </div>
            <h1 className="text-3xl font-heading font-bold text-white">{event.title}</h1>
            <p className="text-muted-foreground">{event.description}</p>
            <div className="flex items-center gap-3 text-sm text-secondary">
              <MapPin className="w-4 h-4" />
              <span>{event.location || "Konum yakında"}</span>
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
