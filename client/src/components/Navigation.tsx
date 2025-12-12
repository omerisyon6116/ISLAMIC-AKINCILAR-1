import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "KİMLİK", href: "#about" },
    { name: "GÖREVLER", href: "#activities" },
    { name: "SAHA NOTLARI", href: "#blog" },
    { name: "VERİTABANI", href: "#knowledge" },
    { name: "DURUŞ", href: "#energy" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-primary/30 py-3 shadow-[0_5px_30px_rgba(0,243,255,0.1)]"
          : "bg-transparent border-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary/20 border border-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold font-heading tracking-widest text-foreground group-hover:text-glow transition-all">
              AKINCILAR
            </span>
          </a>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-6 py-2 text-sm font-medium font-mono text-primary/70 hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/30 transition-all clip-path-cyber"
            >
              {link.name}
            </a>
          ))}
          <Button className="ml-6 bg-secondary text-black hover:bg-white font-bold tracking-widest clip-path-cyber rounded-none border-none">
            KATIL
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-primary border border-primary/30 p-2 bg-black/50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 border-b border-primary/30 p-6 flex flex-col space-y-2 animate-in slide-in-from-top-5 backdrop-blur-xl">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-lg font-mono text-primary/80 hover:text-white hover:bg-primary/20 p-4 border-l-2 border-transparent hover:border-primary transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {">"} {link.name}
            </a>
          ))}
          <Button className="w-full mt-4 bg-secondary text-black font-bold font-heading tracking-widest rounded-none">
            KATIL
          </Button>
        </div>
      )}
    </nav>
  );
}
