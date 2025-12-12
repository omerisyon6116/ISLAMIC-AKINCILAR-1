import { motion } from "framer-motion";
import { BookOpen, Play, Mic } from "lucide-react";
import pattern from "@assets/generated_images/dark_navy_islamic_geometric_pattern_texture.png";

export default function Knowledge() {
  return (
    <section id="knowledge" className="py-24 relative overflow-hidden bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img src={pattern} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-2 block">
              Knowledge Hub
            </span>
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 leading-tight">
              Rooted in Tradition, <br />
              <span className="text-primary">Prepared for Tomorrow</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Access our library of talks, articles, and reading lists curated to build
              an intellectual foundation for the modern Muslim youth.
            </p>

            <div className="space-y-4">
              {[
                { icon: BookOpen, text: "Curated Reading Lists" },
                { icon: Play, text: "Recorded Sessions & Talks" },
                { icon: Mic, text: "Community Podcast" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-white/5 hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-2xl" />
            <div className="relative bg-card border border-white/10 rounded-2xl p-8 md:p-12">
              <span className="text-6xl font-serif text-primary/20 absolute top-6 left-6">"</span>
              <blockquote className="text-xl md:text-2xl font-medium leading-relaxed relative z-10 mb-6">
                Acquire knowledge and impart it to the people. Acquire dignity and tranquility, and be humble to those whom you teach and those who teach you.
              </blockquote>
              <cite className="block text-primary font-bold not-italic">
                — Umar ibn al-Khattab (RA)
              </cite>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
