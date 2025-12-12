import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-primary/30 pt-20 pb-10 relative overflow-hidden">
      {/* Footer Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f3ff05_1px,transparent_1px),linear-gradient(to_bottom,#00f3ff05_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-bold font-heading mb-6 tracking-tight text-white">
              AKIN<span className="text-primary">CILAR</span>
            </h3>
            <p className="text-muted-foreground font-mono text-sm max-w-sm mb-6 border-l border-primary/30 pl-4">
              System status: ONLINE. <br/>
              Reviving the spirit of our heritage through digital and physical action.
            </p>
            <div className="flex gap-4">
               {/* Social placeholders */}
               <div className="w-10 h-10 border border-white/20 hover:border-primary hover:bg-primary hover:text-black flex items-center justify-center transition-all cursor-pointer">
                 <span className="font-bold font-mono text-xs">IG</span>
               </div>
               <div className="w-10 h-10 border border-white/20 hover:border-primary hover:bg-primary hover:text-black flex items-center justify-center transition-all cursor-pointer">
                 <span className="font-bold font-mono text-xs">X</span>
               </div>
               <div className="w-10 h-10 border border-white/20 hover:border-primary hover:bg-primary hover:text-black flex items-center justify-center transition-all cursor-pointer">
                 <span className="font-bold font-mono text-xs">YT</span>
               </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-primary font-mono tracking-widest text-sm">// EXPLORE</h4>
            <ul className="space-y-4 text-muted-foreground font-mono text-sm">
              <li><a href="#" className="hover:text-primary hover:pl-2 transition-all">Identity</a></li>
              <li><a href="#" className="hover:text-primary hover:pl-2 transition-all">Missions</a></li>
              <li><a href="#" className="hover:text-primary hover:pl-2 transition-all">Database</a></li>
              <li><a href="#" className="hover:text-primary hover:pl-2 transition-all">Comms</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-primary font-mono tracking-widest text-sm">// NETWORK</h4>
            <ul className="space-y-4 text-muted-foreground font-mono text-sm">
              <li><a href="#" className="hover:text-primary hover:pl-2 transition-all">Join_Net</a></li>
              <li><a href="#" className="hover:text-primary hover:pl-2 transition-all">Support_Sys</a></li>
              <li><a href="#" className="hover:text-primary hover:pl-2 transition-all">Volunteer_Unit</a></li>
              <li><a href="#" className="hover:text-primary hover:pl-2 transition-all">Time_Log</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-muted-foreground">
          <p>&copy; 2025 AKINCILAR_SYS. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">PRIVACY_PROTOCOL</a>
            <a href="#" className="hover:text-primary transition-colors">TERMS_OF_USE</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
