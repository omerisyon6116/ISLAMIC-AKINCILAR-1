import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Activities() {
  const events = [
    {
      title: "Weekly Halaqa & Tea",
      category: "Education",
      date: "Every Friday, 8:00 PM",
      location: "Main Center",
      description: "Deep dive into history and spirituality with open discussions.",
    },
    {
      title: "Morning Fajr Hike",
      category: "Sports",
      date: "Sunday, 5:30 AM",
      location: "Blue Ridge Trail",
      description: "Start the day with prayer and nature. Breakfast included.",
    },
    {
      title: "Tech & Innovation Workshop",
      category: "Skills",
      date: "Oct 25, 2:00 PM",
      location: "Innovation Hub",
      description: "Coding, robotics, and future skills for the Muslim youth.",
    },
  ];

  return (
    <section id="activities" className="py-24 bg-card relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-4">
              Activities & Events
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Join us in building brotherhood through knowledge, adventure, and skill-building.
            </p>
          </div>
          <button className="text-primary hover:text-primary/80 font-medium flex items-center gap-2 transition-colors">
            View Full Calendar <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-background border border-white/5 rounded-2xl p-6 h-full hover:-translate-y-2 transition-transform duration-300">
                <div className="flex justify-between items-start mb-6">
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                    {event.category}
                  </Badge>
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-bold font-heading mb-3 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  {event.description}
                </p>

                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <Calendar className="w-4 h-4 text-primary" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <MapPin className="w-4 h-4 text-secondary" />
                    {event.location}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
