import { motion } from "framer-motion";
import { Shield, Target, Cpu, Check } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      {/* Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.span 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               className="text-secondary font-mono text-sm tracking-widest mb-2 block"
             >
               // KİMLİK MATRİSİ
             </motion.span>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-heading text-white mb-6"
            >
              AKINCILAR
            </motion.h2>
            
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Çağın karmaşası içinde yönünü kaybetmek istemeyen gençler için kurulmuş <span className="text-white font-bold">bir İslami bilinç ve gelişim merkezidir.</span>
            </p>

            <div className="space-y-8">
              <div className="cyber-card p-6 border-l-4 border-l-primary/50">
                <h3 className="text-lg font-bold text-primary mb-3 font-heading tracking-wider">BİZİM İÇİN İSLAM:</h3>
                <ul className="space-y-2 font-mono text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" /> Sadece geçmişin hatırası değil
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" /> Sadece ritüel değil
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" /> Hayatın tamamını kuşatan canlı bir yol haritasıdır
                  </li>
                </ul>
              </div>

              <div className="cyber-card p-6 border-l-4 border-l-secondary/50">
                <h3 className="text-lg font-bold text-secondary mb-3 font-heading tracking-wider">BURADA GENÇLER:</h3>
                <ul className="space-y-2 font-mono text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> Okur, düşünür, üretir
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> İslami ilimleri modern dünyadan kopmadan ele alır
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> Ahlak, disiplin ve sorumluluk bilincini kuşanır
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="relative">
             <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-20 animate-pulse" />
             <div className="cyber-card p-8 md:p-12 relative border border-white/10">
                <div className="absolute top-0 right-0 p-4 opacity-50">
                   <Cpu className="w-12 h-12 text-primary" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-6 font-heading">HEDEFİMİZ</h3>
                <p className="text-lg text-muted-foreground font-mono leading-relaxed border-l-2 border-primary pl-6">
                  "Kendi değerlerine yabancılaşmayan, dünyayı tanıyan ama dünyaya teslim olmayan bir neslin yetişmesine katkı sunmaktır."
                </p>
                
                <div className="mt-8 flex gap-2">
                   <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-3/4 animate-[shimmer_2s_infinite]" />
                   </div>
                </div>
                <div className="text-right text-xs text-primary font-mono mt-2">YÜKLENİYOR... %100</div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
