import { motion } from "framer-motion";
import { Shield, Target, Cpu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  const features = [
    {
      icon: Shield,
      title: "BROTHERHOOD_PROTOCOL",
      description: "Encrypted unity. Unbreakable bonds. We support each other in the digital and physical realms.",
    },
    {
      icon: Target,
      title: "CORE_PURPOSE",
      description: "Calibrated for success. Living with precise intention guided by eternal source code.",
    },
    {
      icon: Cpu,
      title: "SYSTEM_SERVICE",
      description: "Optimizing the community. Deploying compassion and excellence to all sectors.",
    },
  ];

  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      {/* Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 border-b border-primary/20 pb-8">
          <div>
             <motion.span 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               className="text-secondary font-mono text-sm tracking-widest mb-2 block"
             >
               // IDENTITY_MATRIX
             </motion.span>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-heading text-white"
            >
              WHO WE ARE
            </motion.h2>
          </div>
          <p className="text-right text-muted-foreground font-mono text-sm max-w-xs mt-4 md:mt-0">
            LOADING DATA... <br/>
            REVIVING SPIRIT.EXE
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="cyber-card h-full group hover:bg-primary/5 transition-colors duration-500">
                <div className="p-8 flex flex-col items-start h-full">
                  <div className="w-16 h-16 border border-primary/50 bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:text-white group-hover:bg-primary group-hover:shadow-[0_0_20px_#00f3ff] transition-all duration-300 clip-path-cyber">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-4 text-white group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary/30 group-hover:border-primary transition-colors" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/30 group-hover:border-primary transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
