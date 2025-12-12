import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CallToAction = {
  id: string;
  label: string;
  href: string;
};

export type EventInfo = {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
};

export type SiteContentState = {
  heroCtas: CallToAction[];
  navCta: CallToAction;
  events: EventInfo[];
};

const STORAGE_KEY = "akincilar:site-content";

const defaultContent: SiteContentState = {
  heroCtas: [
    { id: "cta-primary", label: "SİSTEME GİR", href: "#activities" },
    { id: "cta-secondary", label: "BİLGİ_AL", href: "#about" },
  ],
  navCta: { id: "nav-cta", label: "KATIL", href: "#activities" },
  events: [
    {
      id: "halaqa-os-update",
      title: "Halaqa_OS Update",
      category: "Download",
      date: "FRI | 20:00",
      location: "Main Server",
      description:
        "System maintenance for the soul. Discussion and tea integration.",
    },
    {
      id: "fajr-ops-hike",
      title: "Fajr_Ops Hike",
      category: "Physical",
      date: "SUN | 05:30",
      location: "Sector Blue Ridge",
      description: "High altitude training. Sunrise synchronization.",
    },
    {
      id: "future-tech-workshop",
      title: "Future_Tech Workshop",
      category: "Skills",
      date: "OCT 25 | 14:00",
      location: "Innovation Hub",
      description: "Robotics, AI, and ethical hacking for the Muslim youth.",
    },
  ],
};

function sanitizeCtas(ctas: unknown, fallback: CallToAction[]) {
  if (!Array.isArray(ctas)) return fallback;

  return fallback.map((cta) => {
    const incoming = ctas.find((item) => item && item.id === cta.id);
    if (incoming && typeof incoming === "object") {
      return {
        ...cta,
        ...incoming,
      } as CallToAction;
    }
    return cta;
  });
}

function sanitizeNavCta(cta: unknown, fallback: CallToAction) {
  if (cta && typeof cta === "object" && "label" in (cta as Record<string, unknown>)) {
    return { ...fallback, ...(cta as CallToAction) };
  }
  return fallback;
}

function sanitizeEvents(events: unknown, fallback: EventInfo[]) {
  if (!Array.isArray(events)) return fallback;
  return events
    .filter((event) =>
      event &&
      typeof event === "object" &&
      "title" in (event as Record<string, unknown>) &&
      "id" in (event as Record<string, unknown>),
    )
    .map((event) => ({ ...event } as EventInfo));
}

function loadContent(): SiteContentState {
  if (typeof window === "undefined") {
    return defaultContent;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultContent;

    const parsed = JSON.parse(stored) as Partial<SiteContentState>;

    return {
      heroCtas: sanitizeCtas(parsed.heroCtas, defaultContent.heroCtas),
      navCta: sanitizeNavCta(parsed.navCta, defaultContent.navCta),
      events: sanitizeEvents(parsed.events, defaultContent.events),
    };
  } catch (error) {
    console.error("Failed to load site content from storage", error);
    return defaultContent;
  }
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export type SiteContentContextValue = {
  content: SiteContentState;
  updateHeroCta: (id: string, updates: Partial<CallToAction>) => void;
  updateNavCta: (updates: Partial<CallToAction>) => void;
  addEvent: (event: Omit<EventInfo, "id">) => void;
  updateEvent: (id: string, updates: Partial<EventInfo>) => void;
  removeEvent: (id: string) => void;
};

const SiteContentContext = createContext<SiteContentContextValue | undefined>(undefined);

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContentState>(loadContent);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  }, [content]);

  const value = useMemo<SiteContentContextValue>(() => ({
    content,
    updateHeroCta: (id, updates) => {
      setContent((prev) => ({
        ...prev,
        heroCtas: prev.heroCtas.map((cta) =>
          cta.id === id
            ? {
                ...cta,
                ...updates,
              }
            : cta,
        ),
      }));
    },
    updateNavCta: (updates) => {
      setContent((prev) => ({
        ...prev,
        navCta: { ...prev.navCta, ...updates },
      }));
    },
    addEvent: (event) => {
      setContent((prev) => ({
        ...prev,
        events: [
          { ...event, id: createId() },
          ...prev.events,
        ],
      }));
    },
    updateEvent: (id, updates) => {
      setContent((prev) => ({
        ...prev,
        events: prev.events.map((event) =>
          event.id === id
            ? {
                ...event,
                ...updates,
              }
            : event,
        ),
      }));
    },
    removeEvent: (id) => {
      setContent((prev) => ({
        ...prev,
        events: prev.events.filter((event) => event.id !== id),
      }));
    },
  }), [content]);

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used within a SiteContentProvider");
  }
  return context;
}
