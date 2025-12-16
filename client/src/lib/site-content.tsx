import { createContext, useContext, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiBasePath } from "./tenant";
import { apiRequest, queryClient } from "./queryClient";

export type CallToAction = {
  id: string;
  label: string;
  href: string;
};

export type SiteContentState = {
  heroCtas: CallToAction[];
  navCta: CallToAction;
  heroTitle: string;
  heroSubtitle: string;
  siteTitle: string;
  contactEmail: string;
  socials: Record<string, string>;
};

const SITE_CONTENT_KEY = [`${apiBasePath}/site-content`];

const defaultHeroCtas: CallToAction[] = [
  { id: "cta-primary", label: "SİSTEME GİR", href: "#activities" },
  { id: "cta-secondary", label: "BİLGİ_AL", href: "#about" },
];

const defaultContent: SiteContentState = {
  heroCtas: defaultHeroCtas,
  navCta: { id: "nav-cta", label: "KATIL", href: "#activities" },
  heroTitle: "AKINCILAR PROTOCOL",
  heroSubtitle:
    "Akıncılar, imanını tanımak, aklını geliştirmek ve ahlakını güçlendirmek isteyen gençler için kurulmuş bağımsız bir İslami gençlik merkezidir.",
  siteTitle: "AKINCILAR",
  contactEmail: "",
  socials: {},
};

function mapContent(apiContent: any): SiteContentState {
  const socials = (apiContent?.socials ?? {}) as Record<string, string>;

  const heroCtas: CallToAction[] = [
    {
      ...defaultHeroCtas[0],
      label: socials.primaryCtaLabel ?? defaultHeroCtas[0].label,
      href: socials.primaryCtaHref ?? defaultHeroCtas[0].href,
    },
    {
      ...defaultHeroCtas[1],
      label: socials.secondaryCtaLabel ?? defaultHeroCtas[1].label,
      href: socials.secondaryCtaHref ?? defaultHeroCtas[1].href,
    },
  ];

  const navCta: CallToAction = {
    ...defaultContent.navCta,
    label: socials.navCtaLabel ?? defaultContent.navCta.label,
    href: socials.navCtaHref ?? defaultContent.navCta.href,
  };

  return {
    heroCtas,
    navCta,
    heroTitle: apiContent?.heroTitle || defaultContent.heroTitle,
    heroSubtitle: apiContent?.heroSubtitle || defaultContent.heroSubtitle,
    siteTitle: apiContent?.siteTitle || defaultContent.siteTitle,
    contactEmail: apiContent?.contactEmail || defaultContent.contactEmail,
    socials,
  };
}

function buildSocials(content: SiteContentState) {
  return {
    ...content.socials,
    primaryCtaLabel: content.heroCtas[0]?.label ?? defaultHeroCtas[0].label,
    primaryCtaHref: content.heroCtas[0]?.href ?? defaultHeroCtas[0].href,
    secondaryCtaLabel: content.heroCtas[1]?.label ?? defaultHeroCtas[1].label,
    secondaryCtaHref: content.heroCtas[1]?.href ?? defaultHeroCtas[1].href,
    navCtaLabel: content.navCta.label,
    navCtaHref: content.navCta.href,
  } as Record<string, string>;
}

export type SiteContentContextValue = {
  content: SiteContentState;
  isLoading: boolean;
  updateHeroCta: (id: string, updates: Partial<CallToAction>) => void;
  updateNavCta: (updates: Partial<CallToAction>) => void;
  updateHeroContent: (updates: Partial<Pick<SiteContentState, "heroTitle" | "heroSubtitle" | "siteTitle" | "contactEmail">>) => void;
  refresh: () => void;
};

const SiteContentContext = createContext<SiteContentContextValue | undefined>(undefined);

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: SITE_CONTENT_KEY,
    queryFn: async () => {
      const res = await fetch(`${apiBasePath}/site-content`, { credentials: "include" });
      if (!res.ok) {
        throw new Error("İçerik yüklenemedi");
        return { content: null };
      }
      return res.json();
    },
  });

  const content = useMemo(() => mapContent(data?.content), [data]);

  const mutation = useMutation({
    mutationFn: async (next: SiteContentState) => {
      const res = await apiRequest("PATCH", `${apiBasePath}/site-content`, {
        siteTitle: next.siteTitle,
        heroTitle: next.heroTitle,
        heroSubtitle: next.heroSubtitle,
        contactEmail: next.contactEmail,
        socials: buildSocials(next),
      });
      return res.json();
    },
    onSuccess: (response) => {
      queryClient.setQueryData(SITE_CONTENT_KEY, response);
    },
  });

  const persist = (next: SiteContentState) => {
    mutation.mutate(next);
  };

  const updateHeroCta: SiteContentContextValue["updateHeroCta"] = (id, updates) => {
    const updated = {
      ...content,
      heroCtas: content.heroCtas.map((cta) => (cta.id === id ? { ...cta, ...updates } : cta)),
    };
    persist(updated);
  };

  const updateNavCta: SiteContentContextValue["updateNavCta"] = (updates) => {
    const updated = { ...content, navCta: { ...content.navCta, ...updates } };
    persist(updated);
  };

  const updateHeroContent: SiteContentContextValue["updateHeroContent"] = (updates) => {
    const updated = { ...content, ...updates };
    persist(updated);
  };

  const value = useMemo<SiteContentContextValue>(() => ({
    content,
    isLoading,
    updateHeroCta,
    updateNavCta,
    updateHeroContent,
    refresh: () => queryClient.invalidateQueries({ queryKey: SITE_CONTENT_KEY }),
  }), [content, isLoading]);

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used within a SiteContentProvider");
  }
  return context;
}
