import { motion } from "framer-motion";
import { BookOpen, Play, Mic, Database } from "lucide-react";

export default function Knowledge() {
  return (
    <section id="knowledge" className="py-24 relative overflow-hidden bg-background border-t border-primary/20">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="flex items-center gap-2 mb-4 text-secondary font-mono tracking-widest">
              <Database className="w-4 h-4" />
              <span>DATABASE_ACCESS</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-heading mb-6 leading-none">
              TRADITION <br />
              <span className="text-primary text-glow">UPLOADED</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-mono border-l-2 border-secondary/50 pl-4">
              Accessing neural archives... <br/>
              Retrieving timeless wisdom for modern execution.
            </p>

            <div className="space-y-4">
              {[
                { icon: BookOpen, text: "SOURCE_CODE_READINGS" },
                { icon: Play, text: "VISUAL_LOGS" },
                { icon: Mic, text: "AUDIO_TRANSMISSIONS" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary hover:translate-x-2 transition-all cursor-pointer group">
                  <div className="w-10 h-10 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold font-mono text-white tracking-wider">{item.text}</span>
                  <div className="ml-auto w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="relative pt-10">
            {/* Cyber Quote Box */}
            <div className="relative bg-black border border-primary/30 p-8 md:p-12 clip-path-cyber">
              <div className="absolute top-0 right-0 p-2">
                 <div className="flex gap-1">
                   <div className="w-2 h-2 bg-red-500 rounded-full" />
                   <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                   <div className="w-2 h-2 bg-green-500 rounded-full" />
                 </div>
              </div>
              
              <div className="font-mono text-primary/50 mb-4 text-xs">
                // SYSTEM_MSG: FROM COMMANDER_UMAR
              </div>
              
              <blockquote className="text-xl md:text-2xl font-bold font-heading text-white leading-relaxed mb-6">
                "ACQUIRE KNOWLEDGE AND IMPART IT TO THE PEOPLE. ACQUIRE DIGNITY AND TRANQUILITY..."
              </blockquote>
              
              <div className="h-px w-full bg-gradient-to-r from-primary to-transparent mb-4" />
              
              <cite className="block text-secondary font-mono tracking-widest not-italic">
                &gt;&gt; UMAR_IBN_AL-KHATTAB (RA)
              </cite>
            </div>
            
            {/* Background decorative elements */}
            <div className="absolute -z-10 top-0 right-0 w-full h-full border border-white/5 translate-x-4 translate-y-4" />
            <div className="absolute -z-10 top-0 right-0 w-full h-full border border-white/5 translate-x-8 translate-y-8" />
          </div>
        </div>
      </div>
    </section>
  );
}
