import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import ForumShowcase from "@/components/ForumShowcase";
import Activities from "@/components/Activities";
import BlogSection from "@/components/BlogSection";
import Knowledge from "@/components/Knowledge";
import YouthEnergy from "@/components/YouthEnergy";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <Navigation />
      <main>
        <Hero />
        <ForumShowcase />
        <About />
        <Activities />
        <BlogSection />
        <Knowledge />
        <YouthEnergy />
      </main>
      <Footer />
    </div>
  );
}
