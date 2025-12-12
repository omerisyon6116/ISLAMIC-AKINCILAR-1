import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@assets/generated_images/abstract_modern_islamic_youth_energy_hero_image.png";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Abstract Youth Energy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4">
            Est. 2025 • Youth Community
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-heading leading-tight tracking-tight">
            Tradition Meets <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-300 text-glow">
              Future Vision
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
            We are AKINCILAR. A brotherhood of youth dedicated to building a
            strong identity, fostering knowledge, and creating a legacy for the
            generations to come.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 h-auto font-bold rounded-full transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,170,0,0.3)]"
            >
              Join the Movement
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 text-foreground hover:bg-white/5 text-lg px-8 py-6 h-auto rounded-full backdrop-blur-sm group"
            >
              Learn More
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>

        {/* Decorative Element / Right Side */}
        <div className="hidden md:flex justify-end relative">
           {/* Abstract geometric shapes or simply letting the background image shine through more clearly on this side */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1, delay: 0.2 }}
             className="relative w-full aspect-square max-w-md"
           >
              <div className="absolute inset-0 border border-primary/20 rounded-full animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-8 border border-secondary/20 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
              <div className="absolute inset-16 border border-white/10 rounded-full animate-[spin_20s_linear_infinite]" />
           </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-0.5 h-12 bg-gradient-to-b from-primary to-transparent" />
      </motion.div>
    </section>
  );
}
