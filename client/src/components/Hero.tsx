import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Radio } from "lucide-react";
import heroImage from "@assets/generated_images/cyber_islamic_futuristic_geometric_background.png";
import { useSiteContent } from "@/lib/site-content";

export default function Hero() {
  const { content } = useSiteContent();
  const [primaryCta, secondaryCta] = content.heroCtas;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f3ff1a_1px,transparent_1px),linear-gradient(to_bottom,#00f3ff1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Main Background Image */}
      <div className="absolute inset-0 z-[-1] opacity-60 mix-blend-screen">
        <img
          src={heroImage}
          alt="Cyber Islamic Background"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-0" />

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 border border-primary/50 bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase clip-path-cyber">
            <Radio className="w-3 h-3 animate-pulse" />
            System Online • Est. 2025
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black font-heading leading-none tracking-tighter">
            AKIN<span className="text-primary text-glow">CILAR</span>
            <br />
            <span className="text-4xl md:text-5xl font-light tracking-widest text-white/80">PROTOCOL</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground font-sans max-w-xl border-l-2 border-primary/50 pl-6 leading-relaxed">
            Akıncılar, imanını tanımak, aklını geliştirmek ve ahlakını güçlendirmek isteyen gençler için kurulmuş <span className="text-white">bağımsız bir İslami gençlik merkezidir.</span>
          </p>
          
          <div className="space-y-2 text-sm font-mono text-primary/80">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
              İslam’ı yüzeysel değil bilinçli yaşamak
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
              Gençleri pasif değil üreten bireyler kılmak
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
              İnanç, ilim ve aksiyonu buluşturmak
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <Button
              asChild
              size="lg"
              className="bg-primary text-black hover:bg-white hover:text-black text-lg px-10 py-6 h-auto font-bold tracking-widest clip-path-cyber transition-all hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] border-none rounded-none"
            >
              <a href={primaryCta?.href ?? "#activities"}>
                {primaryCta?.label ?? "SİSTEME GİR"} <Zap className="ml-2 w-5 h-5 fill-current" />
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary/50 text-primary hover:bg-primary/10 text-lg px-10 py-6 h-auto font-mono tracking-widest clip-path-cyber rounded-none relative overflow-hidden group"
            >
              <a href={secondaryCta?.href ?? "#about"}>
                <span className="relative z-10 flex items-center">
                  {secondaryCta?.label ?? "BİLGİ_AL"}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Cyber HUD Element */}
        <div className="hidden lg:flex justify-end relative">
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1, delay: 0.2 }}
             className="relative w-full aspect-square max-w-md border border-primary/20 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-sm"
           >
              {/* Rotating Rings */}
              <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-12 border border-secondary/50 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
              <div className="absolute inset-24 border-4 border-primary/10 rounded-full" />
              
              {/* Center Core */}
              <div className="w-32 h-32 bg-primary/10 rounded-full blur-xl animate-pulse" />
              <div className="absolute text-6xl font-heading font-bold text-white mix-blend-overlay">AKN</div>
           </motion.div>
        </div>
      </div>

      {/* Decorative Scanline */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 shadow-[0_0_15px_#00f3ff] animate-[scan_3s_linear_infinite]" />
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </section>
  );
}
