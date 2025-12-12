import { motion } from "framer-motion";
import pattern from "@assets/generated_images/cyber_islamic_futuristic_geometric_background.png";

export default function YouthEnergy() {
  return (
    <section id="energy" className="py-32 relative overflow-hidden bg-primary">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none grayscale contrast-150">
        <img src={pattern} alt="" className="w-full h-full object-cover" />
      </div>
      
      {/* Glitch Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,#000_25%,#000_50%,transparent_50%,transparent_75%,#000_75%,#000_100%)] bg-[size:4px_4px] opacity-10" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="inline-block bg-black text-primary px-4 py-1 font-mono text-sm font-bold mb-6 border border-black">
            STATUS: CRITICAL POWER LEVEL
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black font-heading mb-8 text-black uppercase tracking-tighter leading-none">
            THE YOUTH ARE THE <br /> 
            <span className="text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">SECRET CODE</span>
          </h2>
          
          <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-12 text-black/80 font-bold font-mono">
            // Join a generation that is calibrated to lead, to serve, and to believe.
          </p>
          
          <button className="bg-black text-white hover:bg-white hover:text-black text-xl px-12 py-6 font-bold font-heading tracking-widest clip-path-cyber transition-all hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] border-2 border-black">
            INITIATE_MEMBERSHIP
          </button>
        </motion.div>
      </div>
    </section>
  );
}
