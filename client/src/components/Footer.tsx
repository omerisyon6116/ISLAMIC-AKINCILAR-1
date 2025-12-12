import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold font-heading mb-6 tracking-tight">AKINCILAR</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              A youth community dedicated to reviving the spirit of our heritage through
              knowledge, action, and brotherhood.
            </p>
            <div className="flex gap-4">
               {/* Social placeholders */}
               <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary flex items-center justify-center transition-colors cursor-pointer">
                 <span className="font-bold">IG</span>
               </div>
               <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary flex items-center justify-center transition-colors cursor-pointer">
                 <span className="font-bold">X</span>
               </div>
               <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary flex items-center justify-center transition-colors cursor-pointer">
                 <span className="font-bold">YT</span>
               </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-foreground">Explore</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Who We Are</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Activities</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Reading Lists</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-foreground">Community</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Join Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Donate</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Volunteer</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Calendar</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 AKINCILAR Community. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
