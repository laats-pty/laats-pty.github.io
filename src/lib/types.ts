export interface QuickLink {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  category: string;
  audience: 'todos' | 'temporal';
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export interface SectionText {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export interface AccessSection extends SectionText {
  googleNote: string;
  groups: { audience: QuickLink['audience']; title: string; support: string }[];
}

export interface SiteContent {
  site: { name: string; tagline: string; contactEmail: string; contactPhone: string; contactPhoneLabel: string; logoUrl: string; };
  sections: { accesos: AccessSection; calculadoras: SectionText; faq: SectionText };
  quickLinks: QuickLink[];
  faq: FAQItem[];
}
