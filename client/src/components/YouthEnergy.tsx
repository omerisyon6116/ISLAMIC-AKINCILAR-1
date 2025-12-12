import { motion } from "framer-motion";
import pattern from "@assets/generated_images/dark_navy_islamic_geometric_pattern_texture.png";

export default function YouthEnergy() {
  return (
    <section id="energy" className="py-32 relative overflow-hidden bg-primary text-primary-foreground">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-10 mix-blend-multiply pointer-events-none">
        <img src={pattern} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold font-heading mb-8">
            "The Youth are the <br /> Secret of Power"
          </h2>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-12 opacity-90 font-medium">
            Join a generation that is not afraid to lead, to serve, and to believe.
          </p>
          
          <button className="bg-background text-foreground hover:bg-white text-lg px-10 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Become a Member
          </button>
        </motion.div>
      </div>

      {/* Decorative floating shapes */}
      <div className="absolute top-10 left-10 w-20 h-20 border-4 border-white/20 rounded-full animate-bounce duration-[3000ms]" />
      <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-white/20 rounded-full animate-pulse" />
    </section>
  );
}
