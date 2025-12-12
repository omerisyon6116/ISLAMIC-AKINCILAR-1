import { motion } from "framer-motion";
import pattern from "@assets/generated_images/cyber_islamic_futuristic_geometric_background.png";

export default function YouthEnergy() {
  return (
    <section id="energy" className="py-32 relative overflow-hidden bg-primary text-black">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none grayscale contrast-150">
        <img src={pattern} alt="" className="w-full h-full object-cover" />
      </div>
      
      {/* Glitch Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,#000_25%,#000_50%,transparent_50%,transparent_75%,#000_75%,#000_100%)] bg-[size:4px_4px] opacity-10" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-block bg-black text-primary px-4 py-1 font-mono text-sm font-bold mb-6 border border-black transform -rotate-1">
            MANİFESTO.TXT
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black font-heading mb-12 text-black uppercase tracking-tighter leading-none border-b-4 border-black pb-8">
            AKINCILAR <span className="text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">NEDİR?</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-12 font-bold">
            <div className="space-y-6">
               <p className="text-2xl font-heading leading-tight">
                 Akıncılar, yalnızca bir gençlik merkezi değil, <span className="bg-black text-white px-2">bir duruşun adıdır.</span>
               </p>
               
               <div className="bg-black/10 p-6 border-l-4 border-black">
                 <h4 className="font-mono text-sm mb-4 opacity-70">// BİZ NE İSTEMİYORUZ?</h4>
                 <ul className="space-y-2 list-disc pl-4 text-lg">
                   <li>İnancını savunmakta çekingen,</li>
                   <li>Kimliğini taşımakta kararsız,</li>
                   <li>Hayatın kenarına itilmiş bir gençlik istemiyoruz.</li>
                 </ul>
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-white/20 p-6 border border-black shadow-[8px_8px_0_rgba(0,0,0,1)]">
                 <h4 className="font-mono text-sm mb-4 opacity-70">// BURADA GENÇLER:</h4>
                 <ul className="space-y-2 text-lg font-mono">
                   <li className="flex gap-2"><span>&gt;</span> Sadece dinlemez, sorgular.</li>
                   <li className="flex gap-2"><span>&gt;</span> Sadece öğrenmez, uygular.</li>
                   <li className="flex gap-2"><span>&gt;</span> Sadece izleyici olmaz, özne olur.</li>
                 </ul>
               </div>
               
               <p className="text-xl font-heading leading-tight">
                 "Bizim derdimiz nostalji değil. Biz geçmişten ilham alır, geleceği inşa etmeyi hedefleriz."
               </p>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <h3 className="text-3xl md:text-4xl font-black font-heading uppercase mb-8">
              İMANINI ÇAĞIN ÖNÜNE TAŞIYAN <br/> GENÇLERİN BULUŞMA NOKTASI
            </h3>
            <button className="bg-black text-white hover:bg-white hover:text-black text-xl px-12 py-6 font-bold font-heading tracking-widest clip-path-cyber transition-all hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] border-2 border-black">
              BİZE KATIL
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
