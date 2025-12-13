import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowUpRight, Globe } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { tenantHref, apiBasePath } from "@/lib/tenant";
import { format } from "date-fns";

type Event = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  location: string | null;
  eventDate: string | null;
  createdAt: string;
};

export default function Activities() {
  const { data, isLoading } = useQuery<{ events: Event[] }>({
    queryKey: ["events", apiBasePath],
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/events`, { credentials: "include" });
      if (!res.ok) throw new Error("Etkinlikler yüklenemedi");
      return res.json();
    },
  });

  const events = useMemo(() => data?.events ?? [], [data]);

  const formatDate = (value: string | null) => {
    if (!value) return "—";
    try {
      return format(new Date(value), "dd MMM yyyy HH:mm");
    } catch (error) {
      console.error(error);
      return value;
    }
  };

  return (
    <section id="activities" className="py-24 bg-black relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold font-heading mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              AKTİF GÖREVLER
            </h2>
            <div className="h-1 w-32 bg-primary shadow-[0_0_10px_#00f3ff]" />
          </div>
          <Link
            href={tenantHref("/admin")}
            className="text-primary hover:text-white font-mono text-sm border border-primary/30 px-6 py-2 hover:bg-primary/20 transition-all clip-path-cyber flex items-center gap-2"
          >
            TAKVİMİ YÖNET <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-card/40 border border-primary/20 p-8 text-center text-muted-foreground font-mono">
            Etkinlikler yükleniyor...
          </div>
        ) : events.length === 0 ? (
          <div className="bg-card/40 border border-primary/20 p-8 text-center text-muted-foreground font-mono">
            Henüz etkinlik eklenmedi. İlk etkinliğini oluşturmak için
            {" "}
            <Link href={tenantHref("/admin")} className="text-primary hover:text-white underline underline-offset-4">admin panelini</Link>
            {" "}
            ziyaret et.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                <div className="relative bg-card/40 border-l-4 border-l-primary/50 border-y border-r border-white/5 p-6 h-full hover:border-l-primary hover:bg-card/60 transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <Badge variant="outline" className="border-primary text-primary bg-primary/10 font-mono rounded-none">
                      TÜR: {event.category || "GENEL"}
                    </Badge>
                    <Globe className="w-5 h-5 text-muted-foreground group-hover:text-primary animate-pulse" />
                  </div>

                  <h3 className="text-2xl font-bold font-heading mb-3 text-white group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 text-sm font-mono border-l border-white/10 pl-3">
                    {event.description || "Detaylar yakında."}
                  </p>

                  <div className="space-y-3 pt-6 border-t border-white/5 font-mono text-sm">
                    <div className="flex items-center gap-3 text-secondary">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.eventDate || event.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-foreground/70">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location || "Belirtilmedi"}</span>
                    </div>
                    <Link
                      href={tenantHref(`/events/${event.id}`)}
                      className="inline-flex items-center gap-2 text-primary hover:text-white text-xs"
                    >
                      DETAY <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
