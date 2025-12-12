import { motion } from "framer-motion";
import { Calendar, ArrowRight, Hash, Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock Data for Blog Posts
const blogPosts = [
  {
    id: 1,
    title: "SİBER GÜVENLİK VE AHLAK ATÖLYESİ TAMAMLANDI",
    date: "14 EKİM 2025",
    category: "ATÖLYE",
    excerpt: "Teknolojiyi sadece tüketen değil, güvenli ve ahlaklı bir şekilde yöneten bir nesil için ilk adım atıldı. Atölye notları ve çıktılar sisteme yüklendi.",
    readTime: "3 DK"
  },
  {
    id: 2,
    title: "SABAH NAMAZI VE DOĞA YÜRÜYÜŞÜ: SEKTÖR MAVİ",
    date: "08 EKİM 2025",
    category: "ETKİNLİK",
    excerpt: "Bedeni ve ruhu aynı anda diri tutmak için şafak vaktinde yola düştük. Tefekkür ve hareketin birleştiği o anlardan kareler.",
    readTime: "2 DK"
  },
  {
    id: 3,
    title: "DİJİTAL ÇAĞDA İRADE YÖNETİMİ: HAFTALIK HALKA",
    date: "01 EKİM 2025",
    category: "HALKA",
    excerpt: "Algoritmaların değil, kendi irademizin peşinden gitmek. Haftalık sohbetimizde modern dikkat dağınıklığına karşı nebevi duruşu konuştuk.",
    readTime: "5 DK"
  }
];

export default function BlogSection() {
  return (
    <section id="blog" className="py-24 bg-background relative overflow-hidden border-t border-primary/20">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f3ff05_1px,transparent_1px),linear-gradient(to_bottom,#00f3ff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-primary font-mono text-sm tracking-widest">
              <Hash className="w-4 h-4" />
              <span>LOG_KAYITLARI</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading text-white">
              SAHA <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">NOTLARI</span>
            </h2>
          </div>
          <p className="text-right text-muted-foreground font-mono text-sm max-w-sm mt-4 md:mt-0">
            // Akıncılar topluluğunun aktif çalışmaları, öğrenimleri ve saha deneyimleri.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <article className="h-full flex flex-col bg-card/30 border border-white/10 hover:border-primary/50 transition-all duration-300 relative overflow-hidden clip-path-cyber">
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="p-6 relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="rounded-none border-secondary text-secondary font-mono text-xs px-2 py-0.5">
                      {post.category}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {post.date}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-heading text-white mb-3 leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow font-sans border-l border-white/10 pl-3">
                    {post.excerpt}
                  </p>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <span className="text-xs font-mono text-muted-foreground">
                      OKUMA: {post.readTime}
                    </span>
                    <button className="text-primary text-sm font-bold font-mono flex items-center gap-2 group-hover:gap-3 transition-all">
                      İNCELE <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Decorative Corners */}
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/30 group-hover:border-primary transition-colors" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/30 group-hover:border-primary transition-colors" />
              </article>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 px-8 py-3 border border-white/20 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all font-mono text-sm tracking-widest text-muted-foreground">
            <Bookmark className="w-4 h-4" />
            TÜM KAYITLARI GÖSTER
          </button>
        </div>
      </div>
    </section>
  );
}
